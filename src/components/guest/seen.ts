/** Messages already on screen once never re-animate or re-stream when a tab remounts. */
export const seenMessages = { ids: new Set<string>(), ready: false };

export function markAllMessagesSeen(ids: string[]) {
  ids.forEach((id) => seenMessages.ids.add(id));
  seenMessages.ready = true;
}
