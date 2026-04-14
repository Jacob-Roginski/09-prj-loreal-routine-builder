/**
 * L'Oréal Routine Builder Cloudflare Worker
 *
 * This worker securely forwards requests to the OpenAI API.
 *
 * Setup Instructions:
 * 1. Go to https://dash.cloudflare.com and create a new Worker
 * 2. Copy this code into the worker
 * 3. Add your OpenAI API key as an Environment Variable:
 *    - Go to Settings > Variables > KV Namespace bindings (or use Secrets)
 *    - Add a secret named "OPENAI_API_KEY" with your key
 * 4. Deploy the worker
 * 5. Copy the worker's URL and replace "YOUR_CLOUDFLARE_WORKER_URL" in script.js
 */

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only accept POST requests
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const requestBody = await request.json();
      const { messages, model, useWebSearch } = requestBody;

      // Validate input
      if (!messages || !Array.isArray(messages)) {
        return new Response("Invalid messages format", { status: 400 });
      }

      // Make request to OpenAI API
      const openaiResponse = useWebSearch
        ? await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: model || "gpt-4o",
              input: messages.map((message) => ({
                role: message.role,
                content: [
                  {
                    type: "input_text",
                    text: message.content,
                  },
                ],
              })),
              tools: [{ type: "web_search_preview" }],
              temperature: 0.7,
              max_output_tokens: 1000,
            }),
          })
        : await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: model || "gpt-4o",
              messages: messages,
              temperature: 0.7,
              max_tokens: 1000,
            }),
          });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error("OpenAI API error:", errorData);
        return new Response(
          JSON.stringify({
            error: "OpenAI API error",
            details: errorData,
          }),
          {
            status: openaiResponse.status,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }

      const data = await openaiResponse.json();

      if (useWebSearch) {
        const assistantText = extractResponseText(data);
        const citations = extractCitations(data);

        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: assistantText,
                },
              },
            ],
            citations,
            raw: data,
          }),
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }

      return new Response(JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Worker error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  },
};

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text;
  }

  const segments = [];

  if (Array.isArray(data?.output)) {
    data.output.forEach((item) => {
      if (Array.isArray(item?.content)) {
        item.content.forEach((contentItem) => {
          if (typeof contentItem?.text === "string") {
            segments.push(contentItem.text);
          }
        });
      }
    });
  }

  return segments.join("\n").trim();
}

function extractCitations(data) {
  const citations = [];
  const seen = new Set();

  if (!Array.isArray(data?.output)) {
    return citations;
  }

  data.output.forEach((item) => {
    if (!Array.isArray(item?.content)) {
      return;
    }

    item.content.forEach((contentItem) => {
      const annotations = contentItem?.annotations || [];

      annotations.forEach((annotation) => {
        const url =
          annotation.url ||
          annotation.source_url ||
          annotation.cited_url ||
          annotation.href ||
          annotation.link;
        const title =
          annotation.title || annotation.text || annotation.site_name || url;

        if (!url || seen.has(url)) {
          return;
        }

        seen.add(url);
        citations.push({ title, url });
      });
    });
  });

  return citations;
}
