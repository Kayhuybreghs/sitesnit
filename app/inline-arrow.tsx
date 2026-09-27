import './inline-arrow.css';

const paths = {
  'up-right': 'M5 19 19 5M5 5h14v14',
  'down-left': 'M19 5 5 19M5 5v14h14',
  both: 'M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4',
};

/** A decorative text-sized arrow that cannot become a platform emoji. */
export function InlineArrow({ direction = 'up-right' }: { direction?: keyof typeof paths }) {
  return <svg className="inline-arrow" width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d={paths[direction]} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
