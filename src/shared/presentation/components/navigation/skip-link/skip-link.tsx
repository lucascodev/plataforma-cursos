import styles from './skip-link.module.css';

interface SkipLinkProps {
  targetId: string;
  label: string;
}

// With hash routing, href="#id" would be read as a route, so focus moves to the target directly.
export function SkipLink({ targetId, label }: SkipLinkProps) {
  return (
    <a
      className={styles.link}
      href={`#${targetId}`}
      onClick={(event) => {
        event.preventDefault();
        document.getElementById(targetId)?.focus();
      }}
    >
      {label}
    </a>
  );
}
