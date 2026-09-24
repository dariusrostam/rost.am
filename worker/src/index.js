export default {
  async scheduled(event, env, ctx) {
    const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    if (!res.ok) {
      throw new Error(`Deploy hook failed: ${res.status} ${await res.text()}`);
    }
  },
};
