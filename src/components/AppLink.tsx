import { Link, LinkProps, useLocation } from 'react-router-dom';

interface AppLinkProps extends LinkProps {
  to: string;
}

/**
 * A Link component that automatically preserves query parameters when navigating.
 * Use this instead of react-router-dom's Link for internal navigation.
 */
const AppLink = ({ to, children, ...props }: AppLinkProps) => {
  const location = useLocation();

  const getPathWithParams = (path: string): string => {
    if (!location.search) {
      return path;
    }
    // If target path already has query params, merge them
    if (path.includes('?')) {
      return `${path}&${location.search.slice(1)}`;
    }
    return `${path}${location.search}`;
  };

  return (
    <Link to={getPathWithParams(to)} {...props}>
      {children}
    </Link>
  );
};

export default AppLink;
