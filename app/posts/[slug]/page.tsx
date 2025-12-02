import Container from '../../../components/container';
import PostBody from '../../../components/post-body';
import Header from '../../../components/header';
import PostHeader from '../../../components/post-header';
import { getPostBySlug, getAllPosts } from '../../../lib/api';
import PostTitle from '../../../components/post-title';
import { CMS_NAME } from '../../../lib/constants';
import markdownToHtml from '../../../lib/markdownToHtml';
import { notFound } from 'next/navigation';

// 定义文章数据类型
interface Post {
  slug: string;
  title: string;
  date: string;
  author: {
    name: string;
    picture: string;
  };
  content: string;
  ogImage: {
    url: string;
  };
  coverImage: {
    url: string;
  };
}

// 在App Router中，generateStaticParams替代getStaticPaths
export async function generateStaticParams() {
  const posts = getAllPosts(['slug']);
  
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 页面组件，直接获取数据
export default async function PostPage({ params }: { params: { slug: string } }) {
  try {
    // 获取文章数据，使用与原getStaticProps相同的逻辑
    const post = getPostBySlug(params.slug, [
      'title',
      'date',
      'slug',
      'author',
      'content',
      'ogImage',
      'coverImage',
    ]);
    
    if (!post) {
      notFound();
    }
    
    const content = await markdownToHtml(post.content || '');
    
    return (
      <Container>
        <Header />
        <article className="mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
          />
          <PostBody content={content} />
        </article>
      </Container>
    );
  } catch (error) {
    notFound();
  }
}

// 在App Router中，使用generateMetadata替代Head组件
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug, [
    'title',
    'ogImage',
  ]);
  
  if (!post) {
    return {
      title: 'Not Found',
    };
  }
  
  return {
    title: `${post.title} | Next.js Blog Example with ${CMS_NAME}`,
    openGraph: {
      images: [post.ogImage?.url || ''],
    },
  };
}
