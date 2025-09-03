'use server';

function sleep(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export async function saveSettings(formData: FormData) {
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  // Simulate persistence
  await sleep(400);
  return { success: true };
}

export async function inviteMember(formData: FormData) {
  await sleep(400);
  return { success: true, inviteId: `invite_${Date.now()}` };
}

export async function createApiKey(formData: FormData) {
  await sleep(300);
  const token = `tsk_${Math.random().toString(36).slice(2, 8)}_${Math.random().toString(36).slice(-6)}`;
  return { success: true, token };
}

export async function revokeApiKey(formData: FormData) {
  await sleep(200);
  return { success: true };
}
