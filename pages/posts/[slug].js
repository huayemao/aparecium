import { useRouter } from 'next/router'
import ErrorPage from 'next/error'
import path from 'path'
import fs from 'fs'
import Container from '../../components/container'
import PostBody from '../../components/post-body'
import Header from '../../components/header'
import PostHeader from '../../components/post-header'
import Layout from '../../components/layout'
import { getPostBySlug, getAllPosts } from '../../lib/api'
import PostTitle from '../../components/post-title'
import Head from 'next/head'
import { CMS_NAME } from '../../lib/constants'
import markdownToHtml from '../../lib/markdownToHtml'

export default function Post({ post, morePosts, preview }) {
  const router = useRouter()
  if (!router.isFallback && !post?.slug) {
    return <ErrorPage statusCode={404} />
  }
  return (
    <Layout preview={preview}>
      <Container>
        <Header />
        {router.isFallback ? (
          <PostTitle>Loading…</PostTitle>
        ) : (
          <>
            <article className="mb-32">
              <Head>
                <title>
                  {`${post.title} | Next.js Blog Example with {CMS_NAME}`}
                </title>
                <meta property="og:image" content={post.ogImage.url} />
              </Head>
              <PostHeader
                title={post.title}
                coverImage={post.coverImage}
                date={post.date}
                author={post.author}
              />
              <PostBody content={post.content} />
            </article>
          </>
        )}
      </Container>
    </Layout>
  )
}

export async function getStaticProps({ params }) {
  const post = getPostBySlug(params.slug, [
    'title',
    'date',
    'slug',
    'author',
    'content',
    'ogImage',
    'coverImage',
  ])
  const content = await markdownToHtml(post.content || '')

  return {
    props: {
      post: {
        ...post,
        content,
      },
    },
  }
}

export async function getStaticPaths() {
  // build 时写到 /tmp/dev.db?
  console.log('-----------q------------')
  if (!fs.existsSync("/tmp/dev.db")) {
    console.log('----------------writing---------------')
    const file = path.join(process.cwd(), "tmp", "dev.db");
    const d = fs.readFileSync(file);
    console.log(d.byteLength)
    let writeStream = fs.createWriteStream(`/tmp/dev.db`);
    writeStream.write(d, (...args) => {
      console.log(...args)
      const t = fs.readFileSync('/tmp/dev.db')
      console.log(t.byteLength)
    })
    const t = fs.readFileSync('/tmp/dev.db')
    console.log(t.byteLength)
    // fs.writeFileSync('/tmp/dev.db', d);
  }

  const posts = getAllPosts(['slug'])

  return {
    paths: posts.map((post) => {
      return {
        params: {
          slug: post.slug,
        },
      }
    }),
    fallback: false,
  }
}
