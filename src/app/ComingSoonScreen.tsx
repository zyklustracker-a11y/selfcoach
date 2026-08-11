/**
 * Temporary. The tab bar has four columns from the start, but Heute, Archiv and
 * To-dos arrive in later phases. Each of them says so plainly instead of showing
 * an empty list that looks broken.
 */
export function ComingSoonScreen({ note }: { note: string }) {
  return (
    <div className="px-6.5 pt-[30px]">
      <p className="text-body text-text-muted">{note}</p>
    </div>
  )
}
