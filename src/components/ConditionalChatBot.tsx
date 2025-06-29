'use client';

import { usePathname } from 'next/navigation';
import ChatBot from './ChatBot';

export default function ConditionalChatBot() {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    return null;
  }

  return <ChatBot />;
}
