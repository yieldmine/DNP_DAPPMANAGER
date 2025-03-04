import { PackageVersionData } from "types";
import { topicBaseUrl } from "params";

/**
 * Info selectors
 * ==============
 *
 * Must return an object as:
 *
 * {
 *   name: {string},
 *   result: {string}, (or)
 *   error: {string}
 * }
 */
interface TopicDataItem {
  name: string;
  result?: string;
  error?: string;
}

/**
 * Construct discourse topic
 * ======================
 *
 * Before filing a new topic...
 *
 * Core DNPs versions
 * - admin.dnp.dappnode.eth: 0.1.18
 * ...
 *
 * System info
 * - docker version:
 * ...
 */

interface TopicBodySection {
  title: string;
  items: { name: string; data: string }[];
}

export function formatTopicBody(
  coreDnpVersions: { name: string; version: string | PackageVersionData }[],
  systemData: TopicDataItem[]
): string {
  const sections: TopicBodySection[] = [
    {
      title: "Core DAppNode Packages versions",
      items: coreDnpVersions
        .map(({ name, version }) => ({
          name,
          data:
            typeof version === "object" ? printVersionData(version) : version
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
    },
    {
      title: "System info",
      items: Object.values(systemData)
        .filter(Boolean)
        .map(({ name, result, error }) => ({
          name,
          data: (result || error || "").trim()
        }))
    }
  ];

  return [
    "*Before filing a new topic, please **provide the following information**.*",
    ...sections
      .filter(({ items }) => items.length)
      .map(
        ({ title, items }) =>
          `## ${title}\n` +
          items.map(({ name, data }) => `- **${name}**: ${data}`).join("\n")
      )
  ].join("\n\n");
}

export function formatTopicUrl(body: string) {
  // Construct topicUrl from the available info
  const topicCategory = "5"; // This category is technical support
  const title = "";
  const params = [
    "title=" + encodeURIComponent(title),
    "body=" + encodeURIComponent(body),
    "category_id=" + encodeURIComponent(topicCategory)
  ];
  return topicBaseUrl + "?" + params.join("&");
}

/**
 * Utilities
 * =========
 */

/**
 * Print git version data
 * @param version "0.2.0"
 * @param versionData { version: "0.2.1", branch: "next" }
 * @returns "0.2.0, branch: next"
 */
function printVersionData(versionData: PackageVersionData): string {
  const { branch, commit, version } = versionData || {};
  return [
    version,
    branch && branch !== "master" && `branch: ${branch}`,
    commit && `commit: ${commit.slice(0, 8)}`
  ]
    .filter(data => data)
    .join(", ");
}
