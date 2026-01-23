// @ts-nocheck
import * as __fd_glob_11 from "../content/docs/video/bandwidth.md?collection=docs"
import * as __fd_glob_10 from "../content/docs/video/architecture.md?collection=docs"
import * as __fd_glob_9 from "../content/docs/ia/twelve-labs-integration.md?collection=docs"
import * as __fd_glob_8 from "../content/docs/ia/polling-implementation.md?collection=docs"
import * as __fd_glob_7 from "../content/docs/ia/ai-extraction-examples.md?collection=docs"
import * as __fd_glob_6 from "../content/docs/cron/instagram-urls.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/hello.md?collection=docs"
import { default as __fd_glob_4 } from "../content/docs/video/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/docs/idee/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/docs/ia/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/cron/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content\docs", {"meta.json": __fd_glob_0, "cron/meta.json": __fd_glob_1, "ia/meta.json": __fd_glob_2, "idee/meta.json": __fd_glob_3, "video/meta.json": __fd_glob_4, }, {"hello.md": __fd_glob_5, "cron/instagram-urls.mdx": __fd_glob_6, "ia/ai-extraction-examples.md": __fd_glob_7, "ia/polling-implementation.md": __fd_glob_8, "ia/twelve-labs-integration.md": __fd_glob_9, "video/architecture.md": __fd_glob_10, "video/bandwidth.md": __fd_glob_11, });