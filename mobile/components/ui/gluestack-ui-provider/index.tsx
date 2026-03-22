import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  mode?: 'light' | 'dark' | 'system';
}

/** GluestackUI のプロバイダースタブ（将来的に本実装に置き換え可能） */
export function GluestackUIProvider({ children }: Props) {
  return <>{children}</>;
}
