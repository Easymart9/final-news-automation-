import React from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';
import ArticleManagementClient from '@/components/ArticleManagementClient';

export const dynamic = 'force-dynamic';

export default function ArticleReviewPage() {
  if (!isAuthenticated()) {
    redirect('/admin/login');
  }

  const articles = db.getArticles();

  return <ArticleManagementClient initialArticles={articles} />;
}



