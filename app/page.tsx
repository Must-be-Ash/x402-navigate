import { HomeClient } from './home-client';
import { loadTaxonomy, buildContentIndex } from '@/lib/content-parser';

export default function Home() {
  const taxonomy = loadTaxonomy();
  const contentItems = buildContentIndex();

  return <HomeClient taxonomy={taxonomy} contentItems={contentItems} />;
}
