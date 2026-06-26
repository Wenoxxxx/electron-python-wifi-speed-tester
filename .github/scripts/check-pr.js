// @ts-check
'use strict';

/** @param {{ github: import('@octokit/rest').Octokit, context: import('@actions/github').context, core: import('@actions/core') }} */
module.exports = async ({ github, context, core }) => {
  const pr     = context.payload.pull_request;
  const title  = pr.title || '';
  const body   = pr.body || '';
  const prNum  = pr.number;
  const MARKER = '<!-- pr-check-bot -->';
  const owner  = context.repo.owner;
  const repo   = context.repo.repo;

  const TYPES = ['feat', 'fix', 'docs', 'refactor', 'chore', 'test', 'style', 'perf'];

  function strip(text) {
    return (text ?? '').replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  function section(heading) {
    const m = body.match(new RegExp(`#+\\s+${heading}[\\s\\S]*?(?=\\n#+\\s+|$)`, 'i'));
    return strip(m?.[0].replace(new RegExp(`#+\\s+${heading}`, 'i'), '') ?? '');
  }

  const problems = [];

  // 1. Title must start with "type: description"
  const titlePattern = new RegExp(`^(${TYPES.join('|')}):\\s*\\S.+`);
  if (!titlePattern.test(title.trim())) {
    problems.push(`**Title** must start with one of \`${TYPES.join(', ')}\` followed by \`: \` and a description, e.g. \`feat: add MySQL migration script\`.`);
  }

  // 2. "What was done" must be filled in
  if (section('What was done').length < 10) {
    problems.push('**What was done** is empty or too short — give a short summary of the change.');
  }

  // 3. "Changes" must have at least one real bullet (not just an empty "-")
  const changes = section('Changes');
  const hasBullet = /^-\s*\S/m.test(changes);
  if (!hasBullet) {
    problems.push('**Changes** — list at least one bullet describing what actually changed.');
  }

  // ── Comment ──────────────────────────────────────────────────────────────
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner, repo, issue_number: prNum, per_page: 100,
  });
  const existing = comments.find(c => (c.body ?? '').includes(MARKER));

  if (problems.length === 0) {
    if (existing) {
      await github.rest.issues.deleteComment({ owner, repo, comment_id: existing.id });
    }
  } else {
    const commentBody = [
      MARKER,
      '⚠️ **This PR needs a couple of fixes before review:**',
      '',
      problems.map(p => `- ${p}`).join('\n'),
      '',
      '---',
      '_This comment is removed automatically once everything is filled in._',
    ].join('\n');

    if (existing) {
      await github.rest.issues.updateComment({ owner, repo, comment_id: existing.id, body: commentBody });
    } else {
      await github.rest.issues.createComment({ owner, repo, issue_number: prNum, body: commentBody });
    }
  }

  // ── Labels (optional — skipped silently if the labels don't exist yet) ────
  async function labelExists(name) {
    try {
      await github.rest.issues.getLabel({ owner, repo, name });
      return true;
    } catch (e) {
      if (e.status === 404) return false;
      throw e;
    }
  }

  async function swapLabel(num, add, remove) {
    if (await labelExists(add)) {
      await github.rest.issues.addLabels({ owner, repo, issue_number: num, labels: [add] });
    } else {
      core.warning(`Label "${add}" does not exist in the repo — skipping. Create it once to enable labelling.`);
    }
    try {
      await github.rest.issues.removeLabel({ owner, repo, issue_number: num, name: remove });
    } catch (e) {
      if (e.status !== 404 && e.status !== 410) throw e;
    }
  }

  if (problems.length === 0) {
    await swapLabel(prNum, 'ready for review', 'needs work');
  } else {
    await swapLabel(prNum, 'needs work', 'ready for review');
    core.setFailed(`PR is missing ${problems.length} required item(s) — see bot comment for details.`);
  }
};
