import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { LeetCode, UserProfile, Credential, UserContestInfo } from "leetcode-query";

// Helper functions for Leetcode APIs

var leetcode : LeetCode;

// Create server instance
const server = new McpServer({
    name: "leetcode",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

// Register tools

server.tool(
    "get-user",
    "Get User details for the given user id",
    {
        userId: z.string().describe("User id for the leetcode profile"),
    },
    async ({ userId }) => {

        if (leetcode == null) {
            leetcode = new LeetCode()
        }

        const user : UserProfile = await leetcode.user(userId);
    
        if (!user) {
          return {
            content: [
              {
                type: "text",
                text: "Failed to retrieve user profile",
              },
            ],
          };
        }

    
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(user),
            },
          ],
        };
    },
);

server.tool(
  "get-submissions",
  "Get more than 20 submissions for the user",
  {
      sessionCookie: z.string().describe("Session cookie needed to fetch the submissions of the user"),
      n: z.number().describe("Number of submissions to be fetched for the user")
  },
  async ({ sessionCookie, n }) => {

      const credential = new Credential()
      await credential.init(sessionCookie)
      leetcode = new LeetCode(credential)
      const submissions = await leetcode.submissions({"limit": n})
  
      if (submissions.length == 0) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to log in",
            },
          ],
        };
      }
  
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(submissions),
          },
        ],
      };
  },
);

server.tool(
  "get-contest-info",
  "Get User Contest Info details for the given user id",
  {
      userId: z.string().describe("User id for the leetcode profile"),
  },
  async ({ userId }) => {

      if (leetcode == null) {
          leetcode = new LeetCode()
      }

      const contestInfo : UserContestInfo = await leetcode.user_contest_info(userId);
  
      if (!contestInfo) {
        return {
          content: [
            {
              type: "text",
              text: "Failed to fetch the user contest info",
            },
          ],
        };
      }

  
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(contestInfo),
          },
        ],
      };
  },
);



async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Leetcode MCP Server running on stdio");
  }
  
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});