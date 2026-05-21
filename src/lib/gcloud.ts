/**
 * GCloud Command Explorer — static command catalog + pure helpers
 *
 * This is the single source of truth for the interactive builder.
 * Keep the initial set small but high-signal (data engineering workflows).
 * Adding new commands/flags should be straightforward.
 */

export type FlagValueType = "boolean" | "string" | "enum" | "number";

export interface GCloudFlag {
  name: string; // e.g. "--region"
  short?: string;
  description: string;
  valueType: FlagValueType;
  enumValues?: string[];
  required?: boolean;
  default?: string;
  example?: string;
  category?: "common" | "output" | "iam" | "advanced";
}

export interface PositionalArg {
  name: string;
  description: string;
  required?: boolean;
  example?: string;
}

export interface GCloudCommand {
  name: string;
  description: string;
  longDescription?: string;
  subcommands?: GCloudCommand[];
  flags?: GCloudFlag[];
  positionalArgs?: PositionalArg[];
  examples?: string[];
  notes?: string[];
  isLeaf?: boolean; // terminal command you can actually run
}

// ---------------------------------------------------------------------------
// Common building blocks (reused to keep data DRY)
// ---------------------------------------------------------------------------

const COMMON_REGIONS = [
  "europe-west1",
  "europe-west2",
  "europe-west3",
  "europe-west4",
  "us-central1",
  "us-east1",
  "us-west1",
  "asia-northeast1",
  "asia-southeast1",
];

const OUTPUT_FORMATS = ["json", "yaml", "text", "table"];

const GLOBAL_FLAGS: GCloudFlag[] = [
  {
    name: "--project",
    description: "Project ID or number to use for this invocation",
    valueType: "string",
    example: "my-gcp-project",
    category: "common",
  },
  {
    name: "--region",
    description: "Region to use (required for regional resources like Cloud Run)",
    valueType: "enum",
    enumValues: COMMON_REGIONS,
    example: "europe-west1",
    category: "common",
  },
  {
    name: "--zone",
    description: "Zone to use (for zonal resources)",
    valueType: "string",
    example: "europe-west1-b",
    category: "common",
  },
  {
    name: "--format",
    description: "Output format",
    valueType: "enum",
    enumValues: OUTPUT_FORMATS,
    default: "table",
    category: "output",
  },
  {
    name: "--quiet",
    short: "-q",
    description: "Disable all interactive prompts (useful in scripts)",
    valueType: "boolean",
    category: "common",
  },
  {
    name: "--verbosity",
    description: "Verbosity level",
    valueType: "enum",
    enumValues: ["debug", "info", "warning", "error", "critical", "none"],
    category: "advanced",
  },
  {
    name: "--async",
    description: "Return immediately without waiting for the operation to finish",
    valueType: "boolean",
    category: "common",
  },
  {
    name: "--help",
    description: "Show detailed help for the command",
    valueType: "boolean",
    category: "advanced",
  },
];

// ---------------------------------------------------------------------------
// The command tree (curated, high-quality subset)
// Start minimal: excellent coverage of run + auth/config/storage
// ---------------------------------------------------------------------------

export const gcloudRoot: GCloudCommand = {
  name: "gcloud",
  description: "Google Cloud CLI — the main entry point",
  longDescription:
    "gcloud is the primary command-line tool for Google Cloud. It lets you manage resources, deploy services, and automate workflows without leaving the terminal.",
  subcommands: [
    // --------------------------- AUTH ---------------------------
    {
      name: "auth",
      description: "Manage oauth2 credentials and service accounts",
      longDescription:
        "Commands for authenticating with Google Cloud. Most day-to-day work uses application-default credentials or service accounts.",
      subcommands: [
        {
          name: "login",
          description: "Authorize gcloud to access Google Cloud using your user account",
          isLeaf: true,
          examples: ["gcloud auth login", "gcloud auth login --update-adc"],
          notes: [
            "Opens a browser window for interactive login",
            "Use --update-adc if you also want Application Default Credentials",
          ],
        },
        {
          name: "application-default",
          description: "Manage Application Default Credentials (ADC)",
          subcommands: [
            {
              name: "login",
              description: "Acquire new user credentials for ADC",
              isLeaf: true,
              examples: ["gcloud auth application-default login"],
              notes: ["This is what most client libraries use when running locally"],
            },
          ],
        },
        {
          name: "activate-service-account",
          description: "Activate a service account using a key file",
          isLeaf: true,
          positionalArgs: [
            {
              name: "ACCOUNT",
              description: "The service account email",
              required: true,
              example: "deployer@my-project.iam.gserviceaccount.com",
            },
          ],
          flags: [
            {
              name: "--key-file",
              description: "Path to the JSON service account key",
              valueType: "string",
              required: true,
              example: "./key.json",
              category: "common",
            },
          ],
          examples: [
            "gcloud auth activate-service-account deployer@... --key-file=./key.json",
          ],
          notes: ["Never commit service account keys to git"],
        },
        {
          name: "list",
          description: "List credentialed accounts",
          isLeaf: true,
          examples: ["gcloud auth list"],
        },
        {
          name: "print-access-token",
          description: "Print an access token for the active account",
          isLeaf: true,
          examples: ["gcloud auth print-access-token"],
          notes: ["Useful for quick API calls with curl"],
        },
      ],
    },

    // --------------------------- CONFIG ---------------------------
    {
      name: "config",
      description: "Manage gcloud CLI configuration and properties",
      subcommands: [
        {
          name: "set",
          description: "Set a property value (project, region, etc.)",
          isLeaf: true,
          positionalArgs: [
            { name: "PROPERTY", description: "The property to set", required: true },
            { name: "VALUE", description: "The value", required: true },
          ],
          examples: [
            "gcloud config set project my-gcp-project",
            "gcloud config set run/region europe-west1",
          ],
          notes: ["Common properties: project, account, run/region, core/project"],
        },
        {
          name: "get",
          description: "Get the value of a property",
          isLeaf: true,
          positionalArgs: [{ name: "PROPERTY", description: "Property name", required: true }],
          examples: ["gcloud config get project", "gcloud config get run/region"],
        },
        {
          name: "list",
          description: "List all configuration properties",
          isLeaf: true,
          examples: ["gcloud config list"],
        },
        {
          name: "unset",
          description: "Unset a property so it falls back to default",
          isLeaf: true,
          positionalArgs: [{ name: "PROPERTY", description: "Property to clear", required: true }],
        },
      ],
      flags: [...GLOBAL_FLAGS.filter((f) => f.name !== "--region")],
    },

    // --------------------------- PROJECTS ---------------------------
    {
      name: "projects",
      description: "Manage Google Cloud projects",
      subcommands: [
        {
          name: "list",
          description: "List all projects you can access",
          isLeaf: true,
          examples: ["gcloud projects list"],
        },
        {
          name: "describe",
          description: "Show metadata for a project",
          isLeaf: true,
          positionalArgs: [{ name: "PROJECT_ID", description: "Project to describe", required: true }],
          examples: ["gcloud projects describe my-project"],
        },
        {
          name: "create",
          description: "Create a new project",
          isLeaf: true,
          positionalArgs: [{ name: "PROJECT_ID", description: "New project ID", required: true }],
          flags: [
            {
              name: "--name",
              description: "Human-readable project name",
              valueType: "string",
              example: "My Analytics Project",
            },
          ],
        },
      ],
    },

    // --------------------------- RUN (highest value for data eng) ---------------------------
    {
      name: "run",
      description: "Manage Cloud Run services, jobs, and traffic",
      longDescription:
        "Cloud Run is the serverless container platform. These commands are used daily by data teams for deploying APIs, scheduled jobs, and data processing services.",
      subcommands: [
        // SERVICES
        {
          name: "services",
          description: "Manage Cloud Run services",
          subcommands: [
            {
              name: "list",
              description: "List services in a region or project",
              isLeaf: true,
              examples: ["gcloud run services list --region=europe-west1"],
            },
            {
              name: "describe",
              description: "Show details of a service including latest revision",
              isLeaf: true,
              positionalArgs: [
                { name: "SERVICE", description: "Service name", required: true, example: "analytics-api" },
              ],
              examples: ["gcloud run services describe my-service --region=europe-west1"],
            },
            {
              name: "delete",
              description: "Delete a service and all its revisions",
              isLeaf: true,
              positionalArgs: [{ name: "SERVICE", description: "Service name", required: true }],
            },
            {
              name: "add-iam-policy-binding",
              description: "Grant a role (e.g. Cloud Run Invoker) to a member",
              isLeaf: true,
              positionalArgs: [{ name: "SERVICE", description: "Service name", required: true }],
              flags: [
                {
                  name: "--member",
                  description: "Identity to grant access to (user:, serviceAccount:, group:, etc.)",
                  valueType: "string",
                  required: true,
                  example: "serviceAccount:deployer@...gserviceaccount.com",
                },
                {
                  name: "--role",
                  description: "IAM role",
                  valueType: "string",
                  required: true,
                  example: "roles/run.invoker",
                  default: "roles/run.invoker",
                },
              ],
              notes: ["Use roles/run.invoker to allow unauthenticated HTTPS access"],
            },
          ],
        },

        // DEPLOY — the #1 most used command
        {
          name: "deploy",
          description: "Deploy a new revision of a Cloud Run service",
          isLeaf: true,
          positionalArgs: [
            { name: "SERVICE", description: "Name of the service to deploy", required: true, example: "my-api" },
          ],
          flags: [
            {
              name: "--source",
              description: "Deploy from local source code (uses Cloud Buildpacks)",
              valueType: "string",
              example: ".",
              category: "common",
            },
            {
              name: "--image",
              description: "Container image to deploy (from Artifact Registry or GCR)",
              valueType: "string",
              example: "europe-west1-docker.pkg.dev/my-proj/images/my-api:latest",
              category: "common",
            },
            {
              name: "--region",
              description: "Region in which to deploy the service",
              valueType: "enum",
              enumValues: COMMON_REGIONS,
              required: true,
              category: "common",
            },
            {
              name: "--project",
              description: "Project to deploy into",
              valueType: "string",
              category: "common",
            },
            {
              name: "--allow-unauthenticated",
              description: "Allow public access (adds run.invoker binding)",
              valueType: "boolean",
              category: "iam",
            },
            {
              name: "--port",
              description: "Port the container listens on",
              valueType: "number",
              default: "8080",
            },
            {
              name: "--memory",
              description: "Memory limit (e.g. 512Mi, 1Gi)",
              valueType: "string",
              example: "1Gi",
            },
            {
              name: "--cpu",
              description: "CPU allocation (e.g. 1, 2)",
              valueType: "string",
            },
            {
              name: "--max-instances",
              description: "Maximum number of instances",
              valueType: "number",
            },
            {
              name: "--set-env-vars",
              description: "Set environment variables (KEY=VALUE,KEY2=VALUE2)",
              valueType: "string",
              example: "DB_HOST=10.0.0.5,LOG_LEVEL=info",
            },
            {
              name: "--update-secrets",
              description: "Mount secrets from Secret Manager",
              valueType: "string",
              example: "DB_PASSWORD=projects/123/secrets/db-pw:latest",
            },
            {
              name: "--concurrency",
              description: "Maximum concurrent requests per instance",
              valueType: "number",
              default: "80",
            },
            {
              name: "--timeout",
              description: "Request timeout (e.g. 300s)",
              valueType: "string",
            },
            {
              name: "--no-traffic",
              description: "Deploy without sending traffic to the new revision",
              valueType: "boolean",
            },
            {
              name: "--tag",
              description: "Tag this revision for traffic splitting",
              valueType: "string",
            },
          ],
          examples: [
            "gcloud run deploy my-service --source=. --region=europe-west1 --allow-unauthenticated",
            "gcloud run deploy analytics-job --image=europe-west1-docker.pkg.dev/.../job:latest --region=europe-west1",
          ],
          notes: [
            "When using --source, Cloud Build is invoked automatically (you need the Cloud Build API enabled)",
            "Region must match the region of any VPC connectors or SQL instances you connect to",
            "Use --no-traffic + --tag for canary or blue/green deployments",
          ],
        },

        // JOBS
        {
          name: "jobs",
          description: "Manage Cloud Run jobs (one-off or scheduled tasks)",
          subcommands: [
            {
              name: "list",
              description: "List jobs",
              isLeaf: true,
            },
            {
              name: "describe",
              description: "Show job definition and latest execution",
              isLeaf: true,
              positionalArgs: [{ name: "JOB", description: "Job name", required: true }],
            },
            {
              name: "deploy",
              description: "Create or update a Cloud Run job",
              isLeaf: true,
              positionalArgs: [{ name: "JOB", description: "Job name", required: true }],
              flags: [
                {
                  name: "--image",
                  description: "Container image for the job",
                  valueType: "string",
                  required: true,
                },
                {
                  name: "--region",
                  description: "Region in which the job runs",
                  valueType: "enum",
                  enumValues: COMMON_REGIONS,
                  required: true,
                },
                {
                  name: "--set-env-vars",
                  description: "Environment variables for the job",
                  valueType: "string",
                },
                {
                  name: "--max-retries",
                  description: "Maximum number of retries for a failed task",
                  valueType: "number",
                  default: "3",
                },
                {
                  name: "--task-timeout",
                  description: "Maximum time a task may run before being killed",
                  valueType: "string",
                  example: "3600s",
                },
              ],
            },
            {
              name: "execute",
              description: "Trigger an immediate execution of a job",
              isLeaf: true,
              positionalArgs: [{ name: "JOB", description: "Job name", required: true }],
              flags: [
                {
                  name: "--args",
                  description: "Override arguments for this execution",
                  valueType: "string",
                },
              ],
            },
          ],
        },

        // DOMAIN MAPPINGS — explicitly useful (user has real-world pain here)
        {
          name: "domain-mappings",
          description: "Manage custom domain mappings for Cloud Run services",
          subcommands: [
            {
              name: "list",
              description: "List all domain mappings in the region",
              isLeaf: true,
              examples: ["gcloud run domain-mappings list --region=europe-west1"],
            },
            {
              name: "create",
              description: "Map a custom domain to a Cloud Run service",
              isLeaf: true,
              flags: [
                {
                  name: "--service",
                  description: "The Cloud Run service to map the domain to",
                  valueType: "string",
                  required: true,
                },
                {
                  name: "--domain",
                  description: "The custom domain (must be verified in the project)",
                  valueType: "string",
                  required: true,
                  example: "api.mycompany.com",
                },
                {
                  name: "--region",
                  description: "Region of the Cloud Run service",
                  valueType: "enum",
                  enumValues: COMMON_REGIONS,
                  required: true,
                },
              ],
              examples: [
                "gcloud run domain-mappings create --service=my-service --domain=api.example.com --region=europe-west1",
              ],
              notes: [
                "The domain must be verified via Search Console or DNS TXT record before mapping",
                "After creation, you still need to point DNS (A/AAAA or CNAME) at the load balancer IP shown in the output",
                "Use gcloud run domain-mappings describe to check the status of the mapping",
              ],
            },
            {
              name: "delete",
              description: "Remove a custom domain mapping",
              isLeaf: true,
              flags: [
                {
                  name: "--domain",
                  description: "Custom domain to remove",
                  valueType: "string",
                  required: true,
                },
                {
                  name: "--region",
                  description: "Region of the Cloud Run service",
                  valueType: "enum",
                  enumValues: COMMON_REGIONS,
                  required: true,
                },
              ],
            },
            {
              name: "describe",
              description: "Show details and DNS requirements for a mapping",
              isLeaf: true,
              flags: [
                { name: "--domain", description: "Custom domain to look up", valueType: "string", required: true },
                { name: "--region", description: "Region of the mapping", valueType: "enum", enumValues: COMMON_REGIONS, required: true },
              ],
            },
          ],
        },

        // REVISIONS
        {
          name: "revisions",
          description: "Inspect and manage revisions of a service",
          subcommands: [
            {
              name: "list",
              description: "List revisions for a service",
              isLeaf: true,
              flags: [
                { name: "--service", description: "Name of the Cloud Run service", valueType: "string", required: true },
                { name: "--region", description: "Region of the service", valueType: "enum", enumValues: COMMON_REGIONS, required: true },
              ],
            },
            {
              name: "describe",
              description: "Show the full configuration of one revision",
              isLeaf: true,
              positionalArgs: [{ name: "REVISION", description: "Revision name", required: true }],
            },
          ],
        },

        // LOGS (very handy)
        {
          name: "logs",
          description: "View logs for Cloud Run services and jobs",
          subcommands: [
            {
              name: "read",
              description: "Read recent logs",
              isLeaf: true,
              flags: [
                { name: "--service", description: "Cloud Run service to read logs for", valueType: "string" },
                { name: "--job", description: "Cloud Run job to read logs for", valueType: "string" },
                { name: "--region", description: "Region of the resource", valueType: "enum", enumValues: COMMON_REGIONS },
                {
                  name: "--limit",
                  description: "Maximum number of log entries to return",
                  valueType: "number",
                  default: "20",
                },
              ],
            },
          ],
        },
      ],
    },

    // --------------------------- STORAGE ---------------------------
    {
      name: "storage",
      description: "Manage Google Cloud Storage buckets and objects",
      subcommands: [
        {
          name: "ls",
          description: "List buckets or objects",
          isLeaf: true,
          positionalArgs: [{ name: "URL", description: "gs:// bucket or object path", example: "gs://my-bucket/" }],
          examples: ["gcloud storage ls", "gcloud storage ls gs://my-bucket/data/"],
        },
        {
          name: "cp",
          description: "Copy files to/from buckets (or between buckets)",
          isLeaf: true,
          positionalArgs: [
            { name: "SOURCE", description: "Local path or gs:// URI", required: true },
            { name: "DESTINATION", description: "Local path or gs:// URI", required: true },
          ],
          flags: [
            { name: "--recursive", description: "Copy directories recursively", valueType: "boolean" },
            { name: "--gzip-in-flight", description: "Apply gzip compression in flight", valueType: "boolean" },
          ],
          examples: ["gcloud storage cp ./data.csv gs://my-bucket/raw/"],
        },
        {
          name: "buckets",
          description: "Manage buckets",
          subcommands: [
            {
              name: "create",
              description: "Create a new bucket",
              isLeaf: true,
              positionalArgs: [{ name: "BUCKET_NAME", description: "Globally unique bucket name", required: true }],
              flags: [
                {
                  name: "--location",
                  description: "Location for the bucket (region or multi-region)",
                  valueType: "string",
                  example: "europe-west1",
                  category: "common",
                },
                {
                  name: "--uniform-bucket-level-access",
                  valueType: "boolean",
                  description: "Enforce IAM-only access (recommended)",
                },
              ],
            },
            {
              name: "describe",
              description: "Show bucket metadata and IAM policy",
              isLeaf: true,
              positionalArgs: [{ name: "BUCKET_NAME", description: "Name of the bucket", required: true }],
            },
            {
              name: "list",
              description: "List all buckets in the project",
              isLeaf: true,
            },
          ],
        },
      ],
    },

    // --------------------------- BUILDS (Cloud Build) ---------------------------
    {
      name: "builds",
      description: "Manage Cloud Build triggers, builds, and logs",
      subcommands: [
        {
          name: "submit",
          description: "Submit a build from local source or a tarball",
          isLeaf: true,
          positionalArgs: [{ name: "SOURCE", description: "Path to source (default: .)", example: "." }],
          flags: [
            {
              name: "--config",
              description: "cloudbuild.yaml file (default: cloudbuild.yaml in source)",
              valueType: "string",
            },
            {
              name: "--tag",
              description: "Tag for the built image (shortcut for simple builds)",
              valueType: "string",
            },
          ],
          examples: ["gcloud builds submit --tag europe-west1-docker.pkg.dev/.../my-image"],
          notes: ["Requires the Cloud Build API and appropriate IAM roles (Cloud Build Editor)"],
        },
        {
          name: "list",
          description: "List recent builds in the project",
          isLeaf: true,
        },
        {
          name: "describe",
          description: "Show details and logs link for a build",
          isLeaf: true,
          positionalArgs: [{ name: "BUILD_ID", description: "The build identifier", required: true }],
        },
        {
          name: "log",
          description: "Stream or print the logs of a build",
          isLeaf: true,
          positionalArgs: [{ name: "BUILD_ID", description: "The build identifier", required: true }],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Pure helper functions (the "engine" for the UI)
// ---------------------------------------------------------------------------

/** Find a command node by walking the path from root. */
export function findCommand(path: string[]): GCloudCommand | null {
  let current: GCloudCommand = gcloudRoot;
  for (const segment of path) {
    const next = current.subcommands?.find((c) => c.name === segment);
    if (!next) return null;
    current = next;
  }
  return current;
}

/** Return the list of subcommands available at the current path. */
export function getNextSubcommands(path: string[]): GCloudCommand[] {
  const node = findCommand(path);
  return node?.subcommands ?? [];
}

/** Merge global + command-specific flags for the current context. */
export function getApplicableFlags(path: string[]): GCloudFlag[] {
  const node = findCommand(path);
  if (!node) return GLOBAL_FLAGS;

  // Deduplicate by name (command flags win over globals)
  const byName = new Map<string, GCloudFlag>();
  GLOBAL_FLAGS.forEach((f) => byName.set(f.name, f));
  (node.flags ?? []).forEach((f) => byName.set(f.name, f));

  // Also surface flags from ancestor commands (simple heuristic for v1)
  // For deeper accuracy we could walk up, but this is good enough for the curated tree.
  return Array.from(byName.values());
}

/** Build the full command string from current path + flags. */
export function buildCommandString(
  path: string[],
  flagValues: Record<string, string | boolean>
): string {
  if (path.length === 0) return "gcloud";

  let cmd = "gcloud " + path.join(" ");

  // Positional values are stored under a special key for now (see page)
  const positional = flagValues["__positional__"];
  if (typeof positional === "string" && positional.trim()) {
    cmd += ` ${positional.trim()}`;
  }

  // Append flags in a stable order (required/common first)
  const flags = getApplicableFlags(path);

  const ordered = [
    ...flags.filter((f) => f.required),
    ...flags.filter((f) => !f.required && f.category === "common"),
    ...flags.filter((f) => !f.required && f.category !== "common"),
  ];

  for (const flag of ordered) {
    const val = flagValues[flag.name];
    if (val === undefined || val === false) continue;

    if (flag.valueType === "boolean") {
      if (val === true) cmd += ` ${flag.name}`;
    } else {
      const v = String(val).trim();
      if (v) cmd += ` ${flag.name}=${v}`;
    }
  }

  return cmd;
}

/** Human-friendly label for the current command context. */
export function getContextLabel(path: string[]): string {
  if (path.length === 0) return "gcloud (root)";
  return "gcloud " + path.join(" ");
}

/** Return helpful notes/examples for the current leaf or container command. */
export function getContextHelp(path: string[]): {
  description: string;
  notes: string[];
  examples: string[];
} {
  const node = findCommand(path) ?? gcloudRoot;
  return {
    description: node.longDescription || node.description,
    notes: node.notes ?? [],
    examples: node.examples ?? [],
  };
}

/** Convenience: does the current context expect a primary positional argument? */
export function getPositionalArg(path: string[]): PositionalArg | null {
  const node = findCommand(path);
  return node?.positionalArgs?.[0] ?? null;
}

/** List of common regions (exported for the UI chips). */
export const COMMON_REGIONS_LIST = COMMON_REGIONS;

// Small helper for the UI to know if a flag needs a value input
export function flagNeedsValue(flag: GCloudFlag): boolean {
  return flag.valueType !== "boolean";
}