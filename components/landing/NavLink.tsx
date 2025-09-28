
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

const NavLink = ({ href, children }: NavLinkProps) => (
  <Link href={href} className="text-muted-foreground hover:text-foreground transition-colors duration-200">
    {children}
  </Link>
);

export default NavLink;
