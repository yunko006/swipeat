// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"hello.md": () => import("../content/docs/hello.md?collection=docs"), "ia/ai-extraction-examples.md": () => import("../content/docs/ia/ai-extraction-examples.md?collection=docs"), "ia/twelve-labs-integration.md": () => import("../content/docs/ia/twelve-labs-integration.md?collection=docs"), }),
};
export default browserCollections;