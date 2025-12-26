export interface Problem {
  id: string
  title: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: number // minutes
  description: string
  functionalRequirements: string[]
  nonFunctionalRequirements: string[]
  constraints: string[]
  hints: {
    title: string
    content: string
  }[]
  sampleSolution: {
    overview: string
    components: {
      name: string
      description: string
      technology?: string
    }[]
    dataFlow: string[]
    keyDecisions: {
      decision: string
      rationale: string
    }[]
    scalingConsiderations: string[]
    alternativeApproaches?: string[]
  }
}

export const problems: Problem[] = [
  {
    id: 'sync-engine',
    title: 'Design a Sync Engine',
    category: 'data-pipeline',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a system that executes customer-defined SQL against their data warehouse, detects which rows changed since last run, and pushes changes to destination APIs (like Salesforce, HubSpot, etc.). The system must handle 10,000+ customers with varying sync frequencies and must be resumable and idempotent.`,
    functionalRequirements: [
      'Allow customers to define data models using SQL queries',
      'Execute queries against customer data warehouses (Snowflake, BigQuery, Redshift)',
      'Detect changes since last sync (CDC)',
      'Push changes to destination APIs with field mapping',
      'Support scheduling (every 5 min, hourly, daily, manual trigger)',
      'Provide sync status and detailed logs',
      'Handle sync failures with retry logic',
      'Support pausing/resuming syncs',
    ],
    nonFunctionalRequirements: [
      'Scale to 10,000+ customers',
      'Handle syncs ranging from 10 rows to millions of rows',
      'Exactly-once delivery semantics',
      'Resume from failure without reprocessing entire dataset',
      'Latency: complete syncs within configured interval',
      'High availability (99.9% uptime)',
      'Cost-efficient (minimize warehouse compute)',
    ],
    constraints: [
      'Destination APIs have rate limits (e.g., 100 requests/second)',
      'Customer warehouses have query costs',
      'Some customers share warehouse instances (noisy neighbor potential)',
      'Warehouse credentials must be securely stored and rotated',
      'Must support multiple warehouse types with different SQL dialects',
    ],
    hints: [
      {
        title: 'CDC Strategy',
        content: 'Consider using timestamp-based CDC with a watermark table. Store the max timestamp from last sync, query WHERE updated_at > watermark. Handle clock skew and late-arriving data.',
      },
      {
        title: 'Job Scheduling',
        content: 'Use a distributed job queue (e.g., SQS, Redis Queue) with workers that poll for jobs. Store job state in database with status (pending, running, completed, failed). Use distributed locks to prevent duplicate execution.',
      },
      {
        title: 'Idempotency',
        content: 'Generate idempotency keys based on sync_id + row_hash. Send with API requests. Store processed keys with TTL. This prevents duplicate writes on retry.',
      },
      {
        title: 'Rate Limiting',
        content: 'Implement per-destination rate limiter using token bucket. Track remaining quota in Redis. Queue requests when approaching limit. Fair scheduling across customers.',
      },
      {
        title: 'Resumability',
        content: 'Process in batches (e.g., 1000 rows). Checkpoint after each batch with offset/cursor. On failure, resume from last checkpoint. Store checkpoint in durable storage.',
      },
    ],
    sampleSolution: {
      overview: 'The sync engine uses a scheduler to trigger jobs, workers to execute them, and a CDC mechanism with checkpointing for resumability. Rate limiting and idempotency ensure reliable delivery to destination APIs.',
      components: [
        {
          name: 'Scheduler Service',
          description: 'Cron-like service that creates sync jobs based on customer schedules. Writes jobs to queue.',
          technology: 'Node.js service with database-backed schedule table',
        },
        {
          name: 'Job Queue',
          description: 'Distributed queue holding pending sync jobs. Workers poll for jobs.',
          technology: 'SQS or Redis Queue',
        },
        {
          name: 'Sync Worker Pool',
          description: 'Horizontally scaled workers that execute syncs. Each worker: connects to warehouse, runs query, detects changes, pushes to API.',
          technology: 'Containerized workers (ECS/K8s)',
        },
        {
          name: 'Metadata Store',
          description: 'Stores: sync configurations, credentials, watermarks, checkpoints, job status.',
          technology: 'PostgreSQL',
        },
        {
          name: 'Credential Vault',
          description: 'Securely stores customer warehouse credentials.',
          technology: 'AWS Secrets Manager or HashiCorp Vault',
        },
        {
          name: 'Rate Limiter',
          description: 'Tracks and enforces rate limits per destination API.',
          technology: 'Redis with token bucket algorithm',
        },
        {
          name: 'Idempotency Store',
          description: 'Caches processed idempotency keys to prevent duplicates.',
          technology: 'Redis with TTL',
        },
        {
          name: 'Monitoring & Alerting',
          description: 'Tracks sync success/failure rates, latency, row counts per customer.',
          technology: 'Prometheus + Grafana, PagerDuty',
        },
      ],
      dataFlow: [
        '1. Scheduler checks for syncs due to run, creates job in queue with sync_id',
        '2. Worker polls queue, acquires distributed lock on sync_id',
        '3. Worker fetches sync config and credentials from metadata store',
        '4. Worker connects to customer warehouse and executes SQL query with WHERE updated_at > watermark',
        '5. Results are processed in batches (e.g., 1000 rows)',
        '6. For each row: compute hash, check if changed, generate idempotency key',
        '7. Respect rate limits, queue API requests using rate limiter',
        '8. Push changes to destination API with idempotency key',
        '9. After each batch, checkpoint progress (update watermark, store offset)',
        '10. On completion, update job status, release lock, update metrics',
        '11. On failure, job remains in queue for retry with exponential backoff',
      ],
      keyDecisions: [
        {
          decision: 'Timestamp-based CDC with watermarks',
          rationale: 'Simpler than log-based CDC, works across all warehouse types. Watermark per sync enables resumability. Handles late data with overlap window.',
        },
        {
          decision: 'Distributed job queue with workers',
          rationale: 'Decouples scheduling from execution. Horizontal scaling of workers. Natural retry mechanism via queue visibility timeout.',
        },
        {
          decision: 'Checkpointing every N rows',
          rationale: 'Enables resume on failure without reprocessing. Balances progress tracking overhead with recovery time.',
        },
        {
          decision: 'Idempotency keys = sync_id + row_hash',
          rationale: 'Deterministic key allows safe retries. TTL prevents unbounded growth. Handles API failures gracefully.',
        },
        {
          decision: 'Centralized rate limiter in Redis',
          rationale: 'Shared state across workers. Token bucket allows bursts. Fair scheduling prevents customer monopolizing quota.',
        },
        {
          decision: 'Separate metadata store and credential vault',
          rationale: 'Security: credentials isolated with strict access control. Metadata needs complex queries (SQL), credentials need encryption (vault).',
        },
      ],
      scalingConsiderations: [
        'Horizontally scale workers based on queue depth',
        'Partition queue by priority (enterprise customers, paid tier, free tier)',
        'Shard metadata database if > 100K syncs',
        'Cache sync configurations in workers to reduce DB load',
        'Use read replicas for metadata queries',
        'Implement backpressure: pause scheduling if queue too deep',
        'Per-customer resource quotas to prevent noisy neighbor',
      ],
      alternativeApproaches: [
        'Event-driven: warehouse publishes change events to Kafka, workers consume. More real-time but requires warehouse integration.',
        'Log-based CDC: use Debezium to capture warehouse changes. More accurate but complex setup.',
        'Serverless: AWS Lambda per sync. Simpler ops but cold starts, timeout limits (15 min).',
      ],
    },
  },
  {
    id: 'permission-system',
    title: 'Design a Multi-Tenant Permission System',
    category: 'access-control',
    difficulty: 'advanced',
    estimatedTime: 45,
    description: `Design an access control system for a multi-tenant SaaS where users belong to one or more workspaces. Workspaces have custom roles, and roles contain permissions. Resources (like syncs, models, connections) have individual access controls. Some resources can be shared across workspaces.`,
    functionalRequirements: [
      'Users can belong to multiple workspaces with different roles',
      'Workspaces can define custom roles with specific permissions',
      'Permissions are granular: read, write, delete, admin per resource type',
      'Resources have owners and access control lists',
      'Support sharing resources with: specific users, other workspaces, public links',
      'Hierarchical permissions: workspace-level and resource-level',
      'Audit log: who accessed what and when',
    ],
    nonFunctionalRequirements: [
      'Sub-10ms permission checks (P95)',
      'Support 100K+ users, 10K+ workspaces, 1M+ resources',
      'Permission changes take effect immediately',
      'Consistent: granting access must immediately work',
      'Query: "Which resources can user X access?" efficiently',
    ],
    constraints: [
      'Permission checks on every API request',
      'Cannot scan all resources to build access list',
      'Some users have access to thousands of resources',
      'Must prevent cross-workspace data leaks',
    ],
    hints: [
      {
        title: 'Data Model',
        content: 'Consider: user_workspaces (user_id, workspace_id, role_id), roles (id, workspace_id, name), role_permissions (role_id, permission), resource_acl (resource_id, principal_type, principal_id, permission).',
      },
      {
        title: 'Permission Check Algorithm',
        content: 'Check: Does user have workspace role with permission? OR Does resource ACL grant user/workspace permission? Cache computed permissions per user.',
      },
      {
        title: 'Sharing Across Workspaces',
        content: 'Resource ACL can reference: user:123, workspace:456, public:*. When checking access, union all grants.',
      },
      {
        title: 'Performance',
        content: 'Denormalize effective permissions into user_permissions table. Recompute on role change. Cache in Redis with user_id key. TTL 5 min.',
      },
    ],
    sampleSolution: {
      overview: 'Hybrid RBAC/ACL system with workspace-level roles and resource-level overrides. Denormalized permissions cached in Redis for fast checks.',
      components: [
        {
          name: 'User Store',
          description: 'User accounts, email, authentication.',
          technology: 'PostgreSQL users table',
        },
        {
          name: 'Workspace Store',
          description: 'Workspaces (organizations), memberships, roles.',
          technology: 'PostgreSQL: workspaces, user_workspaces, roles, role_permissions',
        },
        {
          name: 'Resource Store',
          description: 'All resources with ownership and ACLs.',
          technology: 'PostgreSQL: resources, resource_acl tables',
        },
        {
          name: 'Permission Cache',
          description: 'Cached effective permissions per user.',
          technology: 'Redis hash map: user:123 → {workspace:456: [read, write], resource:789: [admin]}',
        },
        {
          name: 'Authorization Service',
          description: 'API for checking and managing permissions. Handles cache invalidation.',
          technology: 'Node.js service with gRPC or HTTP API',
        },
        {
          name: 'Audit Log',
          description: 'Append-only log of access checks and permission changes.',
          technology: 'PostgreSQL audit_log table or Kafka topic',
        },
      ],
      dataFlow: [
        '1. API receives request with user_id and resource_id',
        '2. Authorization service checks cache for user permissions',
        '3. Cache miss: query database for user workspace roles + resource ACL',
        '4. Compute effective permissions: union of workspace + resource grants',
        '5. Store in cache with 5 min TTL',
        '6. Return allow/deny decision',
        '7. Log access check to audit log',
      ],
      keyDecisions: [
        {
          decision: 'Hybrid RBAC (workspace) + ACL (resource)',
          rationale: 'RBAC for common case (workspace members). ACL for exceptions (sharing, special access). Balance simplicity and flexibility.',
        },
        {
          decision: 'Denormalized permission cache',
          rationale: 'Sub-10ms requirement impossible with real-time graph traversal. Pre-compute and cache. Invalidate on permission change.',
        },
        {
          decision: 'Principal-based ACL (user, workspace, public)',
          rationale: 'Flexible sharing model. Can grant to individual users or entire workspaces. Public for link sharing.',
        },
        {
          decision: 'PostgreSQL for source of truth, Redis for cache',
          rationale: 'SQL good for complex permission queries. Redis for fast lookups. Cache TTL handles invalidation and prevents stale data.',
        },
      ],
      scalingConsiderations: [
        'Partition resources and ACLs by workspace_id',
        'Shard cache by user_id hash',
        'Pre-warm cache for active users',
        'Batch permission checks when listing resources',
        'Consider Zanzibar-style system if scale > 10M resources',
      ],
      alternativeApproaches: [
        'Google Zanzibar: relationship tuples (resource, relation, user). More scalable but complex.',
        'Pure RBAC: no resource-level ACL. Simpler but less flexible for sharing.',
        'ABAC: policy-based (OPA). Very flexible but slower checks.',
      ],
    },
  },
  {
    id: 'schema-change-detection',
    title: 'Design a Schema Change Detection System',
    category: 'reliability',
    difficulty: 'intermediate',
    estimatedTime: 45,
    description: `Design a system that monitors customer warehouse tables for schema changes, identifies which downstream configurations are affected, notifies users of breaking changes, and optionally auto-heals simple changes. Must provide an audit trail of all schema changes.`,
    functionalRequirements: [
      'Poll customer warehouse tables periodically for schema changes',
      'Detect: column added/removed/renamed, type changed, nullable changed',
      'Identify affected syncs and field mappings',
      'Classify changes: breaking (column removed, type incompatible) vs. non-breaking (column added)',
      'Notify users of breaking changes via email/Slack',
      'Auto-heal non-breaking changes (e.g., add new column to sync)',
      'Audit log: all detected schema changes with timestamps',
      'Support schema snapshots and diffs',
    ],
    nonFunctionalRequirements: [
      'Detect changes within 1 hour of occurrence',
      'Scale to 10,000+ monitored tables',
      'Minimize warehouse query costs',
      'Low false positive rate',
    ],
    constraints: [
      'Customer warehouses may have 100+ columns per table',
      'Schema queries cost money (charged by warehouse)',
      'Cannot assume customer has change notifications',
    ],
    hints: [
      {
        title: 'Schema Polling',
        content: 'Query INFORMATION_SCHEMA.COLUMNS periodically (e.g., hourly). Store snapshot in database. Compare with previous snapshot to detect changes.',
      },
      {
        title: 'Change Classification',
        content: 'Breaking: column removed, type narrowed (int → smallint), nullable → not null. Non-breaking: column added, type widened (int → bigint), not null → nullable.',
      },
      {
        title: 'Impact Analysis',
        content: 'Query syncs that reference the table. Check field mappings for removed/renamed columns. Generate list of affected configs.',
      },
      {
        title: 'Auto-Healing',
        content: 'For new columns: add to sync with default mapping. For renamed columns (heuristic: similar name, same type): update mapping. Require user confirmation for ambiguous cases.',
      },
    ],
    sampleSolution: {
      overview: 'Scheduled job polls warehouse schema, compares with stored snapshot, classifies changes, analyzes impact, and triggers notifications or auto-healing.',
      components: [
        {
          name: 'Schema Poller',
          description: 'Scheduled job that queries INFORMATION_SCHEMA for monitored tables.',
          technology: 'Cron job or Lambda on schedule',
        },
        {
          name: 'Schema Store',
          description: 'Stores schema snapshots with version history.',
          technology: 'PostgreSQL: table_schemas (table_id, version, schema_json, timestamp)',
        },
        {
          name: 'Change Detector',
          description: 'Compares snapshots, identifies diffs, classifies changes.',
          technology: 'Node.js service with schema diff algorithm',
        },
        {
          name: 'Impact Analyzer',
          description: 'Finds syncs affected by schema changes.',
          technology: 'SQL queries against metadata database',
        },
        {
          name: 'Notification Service',
          description: 'Sends alerts for breaking changes.',
          technology: 'Email (SendGrid), Slack webhooks',
        },
        {
          name: 'Auto-Heal Service',
          description: 'Applies safe schema updates to sync configs.',
          technology: 'API calls to sync management service',
        },
        {
          name: 'Audit Log',
          description: 'Records all schema changes and actions taken.',
          technology: 'PostgreSQL schema_audit table',
        },
      ],
      dataFlow: [
        '1. Scheduler triggers schema polling job every hour',
        '2. Poller queries INFORMATION_SCHEMA for each monitored table',
        '3. Fetch previous schema snapshot from Schema Store',
        '4. Change Detector diffs old vs. new schema',
        '5. Classify changes as breaking or non-breaking',
        '6. Impact Analyzer finds affected syncs via field mapping references',
        '7. For breaking changes: create notification with affected syncs, send to user',
        '8. For non-breaking changes: attempt auto-heal (add column to sync)',
        '9. Log all changes and actions to Audit Log',
        '10. Store new schema snapshot with incremented version',
      ],
      keyDecisions: [
        {
          decision: 'Polling instead of event-driven',
          rationale: 'Warehouses don\'t provide schema change webhooks. Polling is only option. Hourly frequency balances cost and timeliness.',
        },
        {
          decision: 'Schema versioning with snapshots',
          rationale: 'Enables time-travel queries, rollback, and historical analysis. JSON schema easy to diff.',
        },
        {
          decision: 'Conservative auto-healing',
          rationale: 'Only auto-heal obvious safe changes. User approval for ambiguous cases prevents accidental breakage.',
        },
        {
          decision: 'Impact analysis before notification',
          rationale: 'Only notify if change actually affects user syncs. Reduces alert fatigue.',
        },
      ],
      scalingConsiderations: [
        'Batch schema queries: 10 tables per warehouse connection (reuse connection)',
        'Parallelize polling across warehouses (one worker per warehouse)',
        'Cache schema snapshots in memory during comparison',
        'Index table_schemas by table_id and timestamp',
        'Rate limit notifications per user (max 5/hour)',
      ],
      alternativeApproaches: [
        'Webhook-based: If warehouse supports schema change events, subscribe. More real-time but limited availability.',
        'User-triggered: Only check schema when sync runs. Cheaper but may fail sync instead of warning.',
      ],
    },
  },
  {
    id: 'cost-attribution',
    title: 'Design a Cost Attribution Dashboard',
    category: 'reliability',
    difficulty: 'intermediate',
    estimatedTime: 45,
    description: `Design a system that tracks warehouse compute time per sync job, attributes costs to workspaces/teams, provides real-time and historical views, alerts on unusual cost spikes, and suggests optimizations.`,
    functionalRequirements: [
      'Track warehouse query execution time per sync',
      'Calculate cost based on warehouse pricing model (e.g., $/compute-hour)',
      'Attribute costs to workspace/team hierarchy',
      'Real-time dashboard: current month spending, top consumers',
      'Historical view: daily/weekly/monthly trends, compare periods',
      'Alerts: spending exceeds budget, unusual spike detected',
      'Optimization suggestions: expensive queries, inefficient syncs',
      'Export cost reports as CSV/PDF',
    ],
    nonFunctionalRequirements: [
      'Real-time cost updates (within 1 minute of query completion)',
      'Support 10,000+ concurrent syncs',
      'Historical data retention: 2 years',
      'Dashboard loads in < 2 seconds',
    ],
    constraints: [
      'Warehouse APIs have rate limits for usage queries',
      'Different warehouses have different pricing models',
      'Costs must be accurate for billing',
    ],
    hints: [
      {
        title: 'Cost Tracking',
        content: 'After each sync, query warehouse API for execution stats (duration, bytes scanned, compute credits). Calculate cost using pricing formula. Store in database.',
      },
      {
        title: 'Real-Time Updates',
        content: 'Stream cost events to Kafka. Consumer aggregates into time-series database (InfluxDB, Prometheus). Dashboard queries aggregated data.',
      },
      {
        title: 'Anomaly Detection',
        content: 'Calculate baseline: average cost per sync over last 7 days. Alert if current cost > 3x baseline. Use exponential smoothing for trends.',
      },
      {
        title: 'Optimization Suggestions',
        content: 'Identify: syncs with high cost/row ratio, full table scans, unpartitioned queries. Suggest: add indexes, partition tables, reduce sync frequency.',
      },
    ],
    sampleSolution: {
      overview: 'Event-driven system captures sync execution metrics, calculates costs, aggregates into time-series database, and powers dashboard with real-time and historical views.',
      components: [
        {
          name: 'Cost Event Producer',
          description: 'After each sync, publishes cost event with sync_id, workspace_id, duration, cost.',
          technology: 'Sync worker emits events to Kafka',
        },
        {
          name: 'Event Stream',
          description: 'Streams cost events for aggregation and storage.',
          technology: 'Kafka topic: cost-events',
        },
        {
          name: 'Aggregation Service',
          description: 'Consumes events, aggregates by workspace/day, writes to time-series DB.',
          technology: 'Kafka consumer with window aggregation (Kafka Streams or Flink)',
        },
        {
          name: 'Time-Series Store',
          description: 'Stores aggregated cost metrics for fast queries.',
          technology: 'InfluxDB or Prometheus',
        },
        {
          name: 'Cost Database',
          description: 'Raw cost records for detailed drill-down and auditing.',
          technology: 'PostgreSQL: cost_records (sync_id, workspace_id, timestamp, cost)',
        },
        {
          name: 'Anomaly Detector',
          description: 'Monitors cost trends, detects spikes, triggers alerts.',
          technology: 'Python service with statistical models',
        },
        {
          name: 'Dashboard API',
          description: 'Serves cost data to frontend. Queries time-series DB and PostgreSQL.',
          technology: 'GraphQL or REST API',
        },
        {
          name: 'Dashboard UI',
          description: 'Visualizes costs: line charts, bar charts, tables, alerts.',
          technology: 'React with Recharts or D3.js',
        },
      ],
      dataFlow: [
        '1. Sync completes, worker queries warehouse API for execution stats',
        '2. Calculate cost: duration * warehouse rate (get rate from pricing config)',
        '3. Publish cost event to Kafka: {sync_id, workspace_id, timestamp, duration, cost}',
        '4. Aggregation Service consumes events, windows by workspace + day, sums costs',
        '5. Write aggregated metrics to InfluxDB: cost by workspace, by day',
        '6. Store raw cost record in PostgreSQL for drill-down',
        '7. Anomaly Detector periodically checks for spikes (compare to baseline)',
        '8. On anomaly: trigger alert (email, Slack) with details',
        '9. Dashboard queries InfluxDB for time-series charts, PostgreSQL for details',
        '10. Dashboard displays: current month total, top 10 workspaces, trend charts',
      ],
      keyDecisions: [
        {
          decision: 'Event-driven architecture with Kafka',
          rationale: 'Decouples cost tracking from sync execution. Enables real-time aggregation and multiple consumers (dashboard, alerts, billing).',
        },
        {
          decision: 'Time-series database for aggregated metrics',
          rationale: 'Optimized for time-based queries. Fast dashboard loads. Automatic data retention/downsampling.',
        },
        {
          decision: 'Dual storage: InfluxDB + PostgreSQL',
          rationale: 'InfluxDB for fast aggregations, charts. PostgreSQL for raw records, drill-down, auditing.',
        },
        {
          decision: 'Statistical anomaly detection',
          rationale: 'Simple baseline comparison catches most spikes. More advanced ML models can be added later.',
        },
      ],
      scalingConsiderations: [
        'Partition Kafka topic by workspace_id for parallel processing',
        'Aggregate at multiple granularities: minute, hour, day (for different zoom levels)',
        'Cache dashboard queries in Redis (1 min TTL)',
        'Pre-aggregate common queries (e.g., current month total per workspace)',
        'Archive old cost records to S3 after 90 days',
      ],
      alternativeApproaches: [
        'Batch processing: Nightly job aggregates costs. Simpler but not real-time.',
        'Direct warehouse API queries: Poll warehouse for usage. Simpler but rate limits, costs.',
      ],
    },
  },
  {
    id: 'job-scheduler',
    title: 'Design a Distributed Job Scheduler',
    category: 'distributed',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a scheduler that runs thousands of jobs with varying frequencies (5 min to daily), handles job dependencies (Job B runs after Job A completes), provides exactly-once execution guarantees, supports priority lanes, and allows manual triggering and cancellation.`,
    functionalRequirements: [
      'Schedule jobs with cron-like expressions (every 5 min, hourly, daily, weekly)',
      'Support job dependencies (DAG: Job B depends on Job A)',
      'Exactly-once execution (no duplicate runs)',
      'Priority queues (high, normal, low)',
      'Manual trigger: run job immediately',
      'Cancel in-progress jobs',
      'Job timeout: kill if exceeds max duration',
      'Retry failed jobs with backoff',
      'Detailed logs and status for each run',
    ],
    nonFunctionalRequirements: [
      'Scale to 50,000+ jobs',
      'Sub-second scheduling precision for frequent jobs',
      'High availability: scheduler crash doesn\'t miss jobs',
      'Fair scheduling: no job starvation',
    ],
    constraints: [
      'Jobs can take seconds to hours to complete',
      'Some jobs must run at exact times (e.g., daily at 9am)',
      'Scheduler must handle failures gracefully',
    ],
    hints: [
      {
        title: 'Job Storage',
        content: 'Store jobs in database with: schedule (cron), next_run_time, dependencies (array of job_ids), priority, status. Index by next_run_time.',
      },
      {
        title: 'Scheduling Loop',
        content: 'Poller queries jobs WHERE next_run_time <= NOW() AND status = pending. Create job run, enqueue, update next_run_time based on cron.',
      },
      {
        title: 'Exactly-Once',
        content: 'Use distributed lock per job_id. Before creating run, acquire lock with expiry (lease). On completion, update next_run_time and release lock.',
      },
      {
        title: 'Dependencies',
        content: 'Check all parent jobs completed before scheduling dependent job. Use adjacency list or materialized graph. Topological sort for execution order.',
      },
      {
        title: 'Priority Queues',
        content: 'Separate SQS queues per priority. Workers poll high priority first, fallback to normal, then low. Weighted round-robin to prevent starvation.',
      },
    ],
    sampleSolution: {
      overview: 'Database-backed scheduler with poller, distributed locks, priority queues, and dependency resolution. Workers execute jobs and update state.',
      components: [
        {
          name: 'Job Registry',
          description: 'Stores job definitions, schedules, dependencies.',
          technology: 'PostgreSQL: jobs (id, name, schedule, next_run_time, priority, dependencies_json)',
        },
        {
          name: 'Scheduler Poller',
          description: 'Scans for jobs due to run, creates job runs, enqueues.',
          technology: 'Node.js service with 1-second polling loop',
        },
        {
          name: 'Distributed Lock',
          description: 'Ensures exactly-once scheduling per job.',
          technology: 'Redis Redlock or PostgreSQL advisory locks',
        },
        {
          name: 'Job Queue (Priority)',
          description: 'Three queues: high, normal, low priority.',
          technology: 'SQS or Redis Queue',
        },
        {
          name: 'Job Worker Pool',
          description: 'Executes jobs. Polls high priority first.',
          technology: 'Containerized workers (ECS/K8s)',
        },
        {
          name: 'Run Store',
          description: 'Tracks individual job executions.',
          technology: 'PostgreSQL: job_runs (id, job_id, status, start_time, end_time, logs)',
        },
        {
          name: 'Dependency Resolver',
          description: 'Checks if parent jobs completed before scheduling.',
          technology: 'Graph traversal algorithm in Scheduler',
        },
      ],
      dataFlow: [
        '1. Scheduler Poller queries jobs WHERE next_run_time <= NOW() every second',
        '2. For each job: acquire distributed lock (key: job:{id})',
        '3. If lock acquired: check dependencies (query parent job_runs for completion)',
        '4. If dependencies met: create job_run record with status=queued',
        '5. Enqueue job_run_id to appropriate priority queue',
        '6. Update job.next_run_time = calculate_next_run(cron_expression)',
        '7. Release distributed lock',
        '8. Worker polls queue (high → normal → low priority)',
        '9. Worker updates job_run.status = running, start_time = now',
        '10. Worker executes job logic with timeout',
        '11. On success: job_run.status = completed. On failure: status = failed, retry or DLQ',
        '12. Worker logs output to job_run.logs',
      ],
      keyDecisions: [
        {
          decision: 'Database as source of truth + distributed locks',
          rationale: 'Survives scheduler crash. Lock prevents duplicate scheduling. DB indexed query fast enough for 50K jobs.',
        },
        {
          decision: 'Separate next_run_time field',
          rationale: 'Pre-compute next run avoids parsing cron on every poll. Enables efficient index scan.',
        },
        {
          decision: 'Priority queues with weighted polling',
          rationale: 'High priority jobs get preference but low priority not starved (fallback after N high priority polls).',
        },
        {
          decision: 'Dependency check at schedule time',
          rationale: 'Prevents enqueueing jobs that can\'t run yet. Simplifies worker logic.',
        },
        {
          decision: 'Lease-based locking with expiry',
          rationale: 'Scheduler crash releases lock automatically after TTL. Prevents deadlocks.',
        },
      ],
      scalingConsiderations: [
        'Partition jobs table by next_run_time range (hot partition for near-future)',
        'Multiple scheduler pollers with overlapping scans (distributed lock prevents duplication)',
        'Shard workers by job type or customer',
        'Batch create job_runs (100 at a time) for frequently scheduled jobs',
        'Archive completed job_runs after 30 days',
      ],
      alternativeApproaches: [
        'Quartz Scheduler: Java-based, mature. Good for smaller scale.',
        'Airflow: DAG-based, great for data pipelines. Heavier weight.',
        'Temporal: Workflow engine with built-in retries, state. More complex.',
      ],
    },
  },
  {
    id: 'rate-limit-manager',
    title: 'Design a Multi-API Rate Limit Manager',
    category: 'distributed',
    difficulty: 'intermediate',
    estimatedTime: 45,
    description: `Design a system that tracks rate limits for 100+ external APIs (each with different limits), queues requests when limits are approached, fairly distributes quota across customers, handles limit resets (daily, hourly, per-minute), and provides visibility into quota usage.`,
    functionalRequirements: [
      'Configure rate limits per API (e.g., Salesforce: 1000 req/day, HubSpot: 100 req/sec)',
      'Track quota usage per API per customer',
      'Queue requests when approaching limit (e.g., 80% consumed)',
      'Release queued requests when quota replenishes (time-based reset)',
      'Fair distribution: prevent one customer monopolizing quota',
      'Provide dashboard: current usage, remaining quota, queue depth',
      'Handle multiple limit windows (per-second, per-minute, per-day)',
      'Respect retry-after headers from APIs',
    ],
    nonFunctionalRequirements: [
      'Low latency: < 5ms overhead per request',
      'High throughput: 10,000 req/sec across all APIs',
      'Accurate accounting: no quota overruns',
      'Resilient: handle API downtime gracefully',
    ],
    constraints: [
      'Each API has unique rate limit structure',
      'Limits can change (API provider updates)',
      'Distributed system: multiple workers making requests',
    ],
    hints: [
      {
        title: 'Token Bucket Per API',
        content: 'Store in Redis: key = api:{id}:bucket, value = tokens remaining. Refill rate based on limit. Before request: DECR tokens. If < 0, queue.',
      },
      {
        title: 'Multiple Windows',
        content: 'Track separate buckets per window: api:{id}:per_second, api:{id}:per_day. Check all before allowing request. Most restrictive wins.',
      },
      {
        title: 'Fair Scheduling',
        content: 'Separate queue per customer per API: queue:{api_id}:{customer_id}. Round-robin dequeue across customers when releasing from queue.',
      },
      {
        title: 'Retry-After Header',
        content: 'When API returns 429, parse retry-after header. Pause all requests to that API until retry-after time.',
      },
    ],
    sampleSolution: {
      overview: 'Centralized rate limiter using Redis token buckets per API with multiple time windows. Fair queuing across customers. Background job refills tokens and dequeues requests.',
      components: [
        {
          name: 'Rate Limit Config Store',
          description: 'API rate limit configurations.',
          technology: 'PostgreSQL: api_limits (api_id, per_second, per_minute, per_day)',
        },
        {
          name: 'Token Bucket Store',
          description: 'Current token counts per API per window.',
          technology: 'Redis: api:{id}:per_second, api:{id}:per_minute, api:{id}:per_day',
        },
        {
          name: 'Request Queue',
          description: 'Queued requests waiting for quota.',
          technology: 'Redis sorted set per customer per API: queue:{api}:{customer} (score = timestamp)',
        },
        {
          name: 'Rate Limiter Service',
          description: 'Check quota, queue/allow request, update tokens.',
          technology: 'Node.js service with Redis client',
        },
        {
          name: 'Token Refiller',
          description: 'Background job refills tokens periodically.',
          technology: 'Cron job: per-second refill every 1s, per-minute every 60s, per-day daily',
        },
        {
          name: 'Dequeue Worker',
          description: 'Releases queued requests when quota available.',
          technology: 'Background worker polling queue',
        },
        {
          name: 'Dashboard API',
          description: 'Exposes quota usage and queue metrics.',
          technology: 'REST API querying Redis',
        },
      ],
      dataFlow: [
        '1. API request arrives at Rate Limiter Service',
        '2. Fetch API rate limits from config (cached in memory)',
        '3. For each window (per_second, per_minute, per_day):',
        '   - DECR redis key api:{id}:{window}',
        '   - If result < 0: quota exceeded for this window',
        '4. If any window exceeded: INCR (rollback), enqueue request to queue:{api}:{customer}',
        '5. If all windows OK: allow request, return to caller',
        '6. Token Refiller runs periodically: SET api:{id}:{window} = configured_limit',
        '7. Dequeue Worker checks queue depth every 100ms',
        '8. For each API with queued requests: try DECR tokens, if OK dequeue one request fairly (round-robin customers)',
        '9. If API returns 429: parse retry-after, pause API for duration, requeue request',
      ],
      keyDecisions: [
        {
          decision: 'Redis for token buckets',
          rationale: 'Shared state across workers. Atomic INCR/DECR operations. Fast in-memory performance.',
        },
        {
          decision: 'Separate buckets per time window',
          rationale: 'Some APIs have multiple limits (e.g., 100/sec AND 10000/day). Must track all.',
        },
        {
          decision: 'Fair queuing with round-robin',
          rationale: 'Prevent single customer monopolizing quota. Each customer gets fair share.',
        },
        {
          decision: 'Periodic token refill',
          rationale: 'Simpler than leaky bucket continuous refill. Time-based reset matches API behavior.',
        },
        {
          decision: 'Retry-after header handling',
          rationale: 'Respects API guidance. Prevents hammering API during rate limit period.',
        },
      ],
      scalingConsiderations: [
        'Shard Redis by API ID hash',
        'Cache rate limit configs in application memory',
        'Batch dequeue operations (dequeue 10 at a time)',
        'Use Redis pipelining for multi-window checks',
        'Monitor queue depth, auto-scale workers if deep',
      ],
      alternativeApproaches: [
        'Sliding window: More accurate than fixed window but higher memory cost.',
        'Distributed rate limiter library: Kong, Envoy. Good if using API gateway.',
      ],
    },
  },
]
