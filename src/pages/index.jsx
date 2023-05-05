import { useMemo } from 'react';

import Head from 'next/head';
import Link from 'next/link';

import { parse } from 'rss-to-json';

import { useAudioPlayer } from '@/components/AudioProvider';
import { Container } from '@/components/Container';
import { FormattedDate } from '@/components/FormattedDate';
import { dasherize } from '@/utils/dasherize';

function PlayPauseIcon({ playing, ...props }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 10 10" fill="none" {...props}>
      {playing ? (
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.496 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H2.68a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H1.496Zm5.82 0a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5H8.5a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5H7.316Z"
        />
      ) : (
        <path d="M8.25 4.567a.5.5 0 0 1 0 .866l-7.5 4.33A.5.5 0 0 1 0 9.33V.67A.5.5 0 0 1 .75.237l7.5 4.33Z" />
      )}
    </svg>
  );
}

function EpisodeEntry({ episode }) {
  const date = new Date(episode.published);
  const episodeLink = `/${dasherize(episode.title)}`;

  const audioPlayerData = useMemo(
    () => ({
      title: episode.title,
      audio: {
        src: episode.audio.src,
        type: episode.audio.type,
      },
      link: `/${episode.id}`,
    }),
    [episode]
  );
  const player = useAudioPlayer(audioPlayerData);

  return (
    <article
      aria-labelledby={`episode-${episode.id}-title`}
      className="py-10 sm:py-12"
    >
      <Container>
        <div className="flex flex-col items-start">
          <h2
            id={`episode-${episode.id}-title`}
            className="mt-2 text-lg font-bold text-slate-900"
          >
            <Link href={episodeLink}>{episode.title}</Link>
          </h2>
          <FormattedDate
            date={date}
            className="order-first font-mono text-sm leading-7 text-slate-500"
          />
          <p className="mt-1 line-clamp-5 text-base leading-7 text-slate-700">
            {episode.description}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => player.toggle()}
              className="flex items-center text-sm font-bold leading-6 text-pink-500 transition-colors hover:text-pink-700 active:text-pink-900"
              aria-label={`${player.playing ? 'Pause' : 'Play'} episode ${
                episode.title
              }`}
            >
              <PlayPauseIcon
                playing={player.playing}
                className="h-2.5 w-2.5 fill-current"
              />
              <span className="ml-3" aria-hidden="true">
                Listen
              </span>
            </button>
            <span
              aria-hidden="true"
              className="text-sm font-bold text-slate-400"
            >
              /
            </span>
            <Link
              href={episodeLink}
              className="flex items-center text-sm font-bold leading-6 text-pink-500 transition-colors hover:text-pink-700 active:text-pink-900"
              aria-label={`Show notes for episode ${episode.title}`}
            >
              Show notes
            </Link>
          </div>
        </div>
      </Container>
    </article>
  );
}

export default function Home({ episodes }) {
  const description =
    'Veteran web developers, and whiskey connoisseurs, RobbieTheWagner and ' +
    'Charles William Carpenter III host this informal web development podcast ' +
    'covering a wide array of topics including TypeScript, Tailwind, tractors, TV ' +
    'shows and everything in-between.';
  const imageURL = 'http://whiskeywebandwhatnot.fm/images/www.png';
  return (
    <>
      <Head>
        <title>
          Whiskey Web and Whatnot - A whiskey fueled fireside chat with your
          favorite web developers.
        </title>
        <meta name="description" content={description} />
        <meta content={imageURL} name="og:image"></meta>
        <meta content={imageURL} name="twitter:image:src"></meta>
        <meta content="summary_large_image" name="twitter:card" />
      </Head>
      <div className="pb-12 pt-16 sm:pb-4 lg:pt-12">
        <Container>
          <h1 className="text-2xl font-bold leading-7 text-slate-900">
            Episodes
          </h1>
        </Container>
        <div className="divide-y divide-slate-100 sm:mt-4 lg:mt-8 lg:border-t lg:border-slate-100">
          {episodes.map((episode) => (
            <EpisodeEntry key={episode.id} episode={episode} />
          ))}
        </div>
      </div>
    </>
  );
}

export async function getStaticProps() {
  let feed = await parse('https://feeds.megaphone.fm/PODRYL5396410253');

  return {
    props: {
      episodes: feed.items.map(
        ({ id, title, description, enclosures, published }) => ({
          id,
          title: `${title}`,
          published,
          description,
          audio: enclosures.map((enclosure) => ({
            src: enclosure.url,
            type: enclosure.type,
          }))[0],
        })
      ),
    },
    revalidate: 10,
  };
}
