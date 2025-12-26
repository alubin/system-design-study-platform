export interface Topic {
  id: string
  title: string
  category: string
  concepts: {
    title: string
    content: string
    eli5: string
    technical: string
  }[]
  terminology: {
    term: string
    definition: string
  }[]
  commonMistakes: string[]
  relatedTopics: string[]
}

export const categories = [
  { id: 'data-pipeline', name: 'Data Pipeline & Sync Systems' },
  { id: 'distributed', name: 'Distributed Systems Fundamentals' },
  { id: 'multi-tenant', name: 'Multi-Tenant SaaS Architecture' },
  { id: 'access-control', name: 'Access Control & Permissions' },
  { id: 'reliability', name: 'Reliability & Observability' },
  { id: 'storage', name: 'Storage & Databases' },
]

export const topics: Topic[] = [
  // DATA PIPELINE & SYNC SYSTEMS
  {
    id: 'cdc',
    title: 'Change Data Capture (CDC)',
    category: 'data-pipeline',
    concepts: [
      {
        title: 'What is CDC?',
        content: 'Change Data Capture is a set of software design patterns used to determine and track changes in data so that action can be taken using the changed data.',
        eli5: 'Imagine you have a huge notebook with millions of pages. Instead of reading the entire notebook every time to find what changed, CDC is like having a smart bookmark that only shows you the pages that were updated since you last checked.',
        technical: 'CDC monitors and captures changes (inserts, updates, deletes) in a database and makes them available to downstream systems. It enables near real-time data replication and synchronization without impacting source system performance through expensive full table scans.',
      },
      {
        title: 'Timestamp-Based CDC',
        content: 'Uses a "last_modified" or "updated_at" timestamp column to identify rows that changed since the last sync.',
        eli5: 'Like sorting your mail by date - you only look at letters that arrived after you last checked your mailbox.',
        technical: 'Query: SELECT * FROM table WHERE updated_at > :last_sync_time. Simple to implement, but requires disciplined schema design (every table needs timestamp column), and can miss hard deletes unless using a soft-delete pattern. Best for append-heavy workloads.',
      },
      {
        title: 'Diff-Based CDC',
        content: 'Compares current state with previous state by computing a hash or checksum of each row.',
        eli5: 'Taking a photo of your room every day and comparing it with yesterday\'s photo to see what moved or changed.',
        technical: 'Compute hash of row contents (e.g., MD5, SHA256), store hash, compare on next run. Can detect all changes including deletes (missing rows), but computationally expensive for large datasets. Often combined with partitioning to limit comparison scope.',
      },
      {
        title: 'Log-Based CDC',
        content: 'Reads the database transaction log (binlog, WAL) to capture changes as they occur.',
        eli5: 'Like reading a diary that the database keeps of everything it does - you get a real-time record of every change without asking the database to do extra work.',
        technical: 'Tools like Debezium, Maxwell, or native features (MySQL binlog, Postgres logical replication) stream changes with minimal source impact. Provides true real-time updates, captures schema changes, and includes deletes. Requires operational expertise and log retention configuration.',
      },
    ],
    terminology: [
      { term: 'Binlog', definition: 'Binary log in MySQL that records all changes to data in the order they occur' },
      { term: 'WAL', definition: 'Write-Ahead Log in PostgreSQL used for crash recovery and replication' },
      { term: 'Watermark', definition: 'A timestamp or offset marking the last successfully processed change' },
      { term: 'Soft Delete', definition: 'Marking records as deleted (e.g., is_deleted=true) rather than removing them' },
    ],
    commonMistakes: [
      'Not handling hard deletes - timestamp/diff methods miss deleted rows',
      'Ignoring time zone inconsistencies when using timestamp-based CDC across regions',
      'Underestimating log storage requirements for log-based CDC',
      'Not implementing idempotency - processing the same change multiple times',
      'Failing to handle schema changes in the source table',
    ],
    relatedTopics: ['idempotency', 'batch-vs-stream', 'data-warehouse'],
  },
  {
    id: 'batch-vs-stream',
    title: 'Batch vs. Stream Processing',
    category: 'data-pipeline',
    concepts: [
      {
        title: 'Batch Processing',
        content: 'Processing large volumes of data in scheduled intervals (hourly, daily, etc.)',
        eli5: 'Like doing laundry - you collect dirty clothes throughout the week and wash them all at once on Sunday.',
        technical: 'Processes bounded datasets with defined start/end. Optimized for high throughput over large volumes. Tools: Spark, MapReduce, dbt. Use when: latency tolerance is high, cost efficiency is critical, data completeness required before processing.',
      },
      {
        title: 'Stream Processing',
        content: 'Continuously processing data as it arrives in near real-time.',
        eli5: 'Like a dishwasher that automatically starts washing each dish the moment you put it in.',
        technical: 'Processes unbounded datasets with no defined end. Optimized for low latency. Tools: Flink, Kafka Streams, Spark Streaming. Use when: real-time insights needed, event-driven architecture, continuous monitoring/alerting required.',
      },
      {
        title: 'Lambda Architecture',
        content: 'Hybrid approach with both batch and speed layers, merged at serving layer.',
        eli5: 'Having both a slow, thorough fact-checker (batch) and a fast news reporter (stream) working together.',
        technical: 'Batch layer provides comprehensive, accurate results. Speed layer provides low-latency approximate results. Serving layer merges both. Pros: handles late-arriving data, provides both accuracy and speed. Cons: maintaining two codebases, complexity.',
      },
      {
        title: 'Kappa Architecture',
        content: 'Everything is a stream - reprocessing historical data by replaying the stream.',
        eli5: 'Recording everything on video so you can rewatch and reanalyze anytime.',
        technical: 'Single processing engine for both real-time and historical data. All data treated as streams. Simplifies architecture but requires careful stream retention management. Best when: business logic changes frequently, reprocessing is common.',
      },
    ],
    terminology: [
      { term: 'Throughput', definition: 'Volume of data processed per unit time (e.g., GB/hour)' },
      { term: 'Latency', definition: 'Time delay between data production and processing result' },
      { term: 'Watermark', definition: 'Timestamp threshold for considering data "complete" in streaming' },
      { term: 'Windowing', definition: 'Grouping stream data into finite chunks (tumbling, sliding, session windows)' },
    ],
    commonMistakes: [
      'Choosing streaming when batch would be cheaper and sufficient',
      'Not considering data arrival patterns - late data handling',
      'Underestimating operational complexity of stream processing',
      'Ignoring exactly-once processing requirements',
      'Not planning for reprocessing scenarios',
    ],
    relatedTopics: ['cdc', 'event-driven', 'idempotency'],
  },
  {
    id: 'idempotency',
    title: 'Idempotency in Data Pipelines',
    category: 'data-pipeline',
    concepts: [
      {
        title: 'What is Idempotency?',
        content: 'An operation that produces the same result no matter how many times it is executed.',
        eli5: 'Like pressing an elevator button - pressing it 10 times has the same effect as pressing it once.',
        technical: 'Critical for distributed systems where retries are inevitable. Ensures operations can be safely retried without producing duplicate side effects or corrupting state. f(x) = f(f(x))',
      },
      {
        title: 'Idempotency Keys',
        content: 'Unique identifiers used to deduplicate requests/operations.',
        eli5: 'Like giving each letter you send a unique tracking number - if you accidentally send the same letter twice, the recipient can see it\'s a duplicate and ignore the second one.',
        technical: 'Client generates UUID or deterministic key, sends with request. Server stores key with operation result. On retry, server returns cached result if key exists. TTL on keys prevents unbounded growth. Used by Stripe, AWS, and other APIs.',
      },
      {
        title: 'Exactly-Once Delivery',
        content: 'Guaranteeing that each message is delivered and processed exactly one time.',
        eli5: 'Like a security guard at a party checking IDs - they make absolutely sure each person enters once and only once, even if they try multiple times.',
        technical: 'Hardest to achieve. Requires: idempotent consumers, transactional outbox pattern, or distributed transactions. Kafka achieves this through producer idempotence + transactions + consumer offsets in same transaction.',
      },
      {
        title: 'At-Least-Once vs. At-Most-Once',
        content: 'Delivery guarantees that trade off duplicates vs. data loss.',
        eli5: 'At-least-once: like sending a package with tracking but the recipient might get two copies. At-most-once: like shouting across a noisy room - they might not hear you at all.',
        technical: 'At-least-once: acknowledge after processing (may duplicate). At-most-once: acknowledge before processing (may lose). Most systems use at-least-once + idempotent processing to achieve exactly-once semantics.',
      },
    ],
    terminology: [
      { term: 'Retry', definition: 'Attempting an operation again after failure' },
      { term: 'Deduplication', definition: 'Removing duplicate entries or operations' },
      { term: 'Transactional Outbox', definition: 'Pattern to atomically update database and publish event' },
      { term: 'Deterministic Key', definition: 'Key generated from request content (not random) for consistent retries' },
    ],
    commonMistakes: [
      'Using random UUIDs for idempotency keys instead of deterministic ones',
      'Not setting TTL on stored idempotency keys',
      'Assuming database uniqueness constraints are sufficient for all cases',
      'Ignoring partial failures in multi-step operations',
      'Not testing retry behavior under failure conditions',
    ],
    relatedTopics: ['async-jobs', 'event-driven', 'retry-strategies'],
  },
  {
    id: 'data-warehouse',
    title: 'Data Warehouse Integration',
    category: 'data-pipeline',
    concepts: [
      {
        title: 'What is a Data Warehouse?',
        content: 'Centralized repository optimized for analytics and reporting on historical data.',
        eli5: 'Like a giant, super-organized library where all your company\'s data is stored in a way that makes it easy to find patterns and create reports.',
        technical: 'OLAP (Online Analytical Processing) system. Columnar storage, optimized for read-heavy analytical queries. Examples: Snowflake, BigQuery, Redshift. Supports complex JOINs, aggregations, window functions at scale.',
      },
      {
        title: 'Warehouse Architecture Basics',
        content: 'Understanding compute and storage separation in modern cloud warehouses.',
        eli5: 'Like separating your filing cabinet (storage) from your desk (compute) - you can get a bigger desk for busy days without buying more filing cabinets.',
        technical: 'Snowflake/BigQuery separate compute from storage. Storage scales independently. Compute charged by query time. Virtual warehouses (Snowflake) or slots (BigQuery) handle concurrent queries. Enables pause/resume for cost optimization.',
      },
      {
        title: 'Query Optimization',
        content: 'Techniques to improve query performance and reduce costs on large datasets.',
        eli5: 'Like organizing your closet so you can find your favorite shirt without dumping everything on the floor.',
        technical: 'Partition pruning: only scan relevant partitions. Clustering keys (Snowflake) or partitioning/clustering (BigQuery) co-locate related data. Use EXPLAIN to understand query plans. Avoid SELECT *, limit column scans. Materialized views for repeated aggregations.',
      },
      {
        title: 'Connection Pooling & Credentials',
        content: 'Managing database connections efficiently and securely.',
        eli5: 'Instead of making a new phone call every time you want to talk, you keep a few phone lines open and reuse them.',
        technical: 'Connection pools reuse connections to avoid handshake overhead. Configure pool size based on concurrency needs. Use service accounts with least privilege. Rotate credentials regularly. Consider credential managers (AWS Secrets Manager, HashiCorp Vault).',
      },
    ],
    terminology: [
      { term: 'OLAP', definition: 'Online Analytical Processing - optimized for complex queries on large datasets' },
      { term: 'OLTP', definition: 'Online Transaction Processing - optimized for transactional workloads' },
      { term: 'Partition', definition: 'Division of table into segments based on column values (e.g., by date)' },
      { term: 'Clustering', definition: 'Physical organization of data to co-locate related rows' },
      { term: 'Virtual Warehouse', definition: 'Snowflake term for isolated compute cluster' },
    ],
    commonMistakes: [
      'Running warehouse 24/7 when workload is sporadic',
      'Not partitioning large tables by date or other high-cardinality keys',
      'Querying all columns when only a few are needed',
      'Hardcoding credentials instead of using secret management',
      'Not monitoring query costs and usage patterns',
    ],
    relatedTopics: ['database-selection', 'caching', 'data-modeling'],
  },

  // DISTRIBUTED SYSTEMS FUNDAMENTALS
  {
    id: 'async-jobs',
    title: 'Async Job Processing',
    category: 'distributed',
    concepts: [
      {
        title: 'Why Async Jobs?',
        content: 'Decouple request handling from long-running tasks to improve responsiveness.',
        eli5: 'Like dropping off your dry cleaning instead of waiting at the store - you can go do other things and pick it up when it\'s ready.',
        technical: 'HTTP requests have timeout limits. Long tasks (email sending, report generation, data processing) should be asynchronous. Client gets immediate acknowledgment, polls for status, or receives webhook on completion.',
      },
      {
        title: 'Job Queue Design',
        content: 'Message queue patterns for distributing work to worker processes.',
        eli5: 'Like a to-do list that multiple people can grab tasks from - whoever is free takes the next item.',
        technical: 'Producer pushes jobs to queue (SQS, RabbitMQ, Redis). Workers poll queue, process jobs, acknowledge completion. Supports retry, priority lanes, dead letter queues. FIFO vs. standard queues trade ordering for throughput.',
      },
      {
        title: 'Worker Pools & Scaling',
        content: 'Managing multiple worker processes to handle job load.',
        eli5: 'Hiring more cashiers during lunch rush, and sending them home during quiet hours.',
        technical: 'Horizontal scaling: add workers based on queue depth. Vertical scaling: increase worker resources. Auto-scaling based on metrics (queue length, CPU, memory). Consider worker specialization for different job types.',
      },
      {
        title: 'Resumable Jobs',
        content: 'Designing jobs that can be paused and resumed without starting over.',
        eli5: 'Like a video game that saves your progress - if you quit and come back later, you don\'t start from level 1.',
        technical: 'Checkpoint progress periodically. Store state externally (database, S3). Use cursor-based pagination for large datasets. Implement at granular level (per-row, per-batch). Enables graceful shutdown and failure recovery.',
      },
    ],
    terminology: [
      { term: 'Dead Letter Queue', definition: 'Queue for messages that failed processing after max retries' },
      { term: 'Visibility Timeout', definition: 'Duration a message is hidden from other consumers while being processed' },
      { term: 'Backoff', definition: 'Increasing delay between retry attempts' },
      { term: 'Poison Pill', definition: 'Special message signaling workers to shut down' },
    ],
    commonMistakes: [
      'Not implementing job timeouts - jobs hang forever',
      'Losing job context on worker crash (not checkpointing)',
      'Not monitoring queue depth - missing scaling signals',
      'Synchronous processing in API handlers for slow operations',
      'No observability into job success/failure rates',
    ],
    relatedTopics: ['rate-limiting', 'retry-strategies', 'event-driven'],
  },
  {
    id: 'rate-limiting',
    title: 'Rate Limiting & Backpressure',
    category: 'distributed',
    concepts: [
      {
        title: 'Why Rate Limiting?',
        content: 'Protect systems from overload and ensure fair resource allocation.',
        eli5: 'Like a nightclub bouncer who only lets in a certain number of people at a time to prevent overcrowding.',
        technical: 'Prevents: DoS attacks, resource exhaustion, noisy neighbor problems. Enforces: SLA compliance, fair usage quotas. Implemented at: API gateway, application layer, infrastructure layer.',
      },
      {
        title: 'Token Bucket Algorithm',
        content: 'Allows bursts up to bucket capacity while enforcing average rate.',
        eli5: 'You have a bucket that refills with tokens every second. Each action costs a token. If you have tokens, you can act immediately. If not, you wait for refill.',
        technical: 'Bucket capacity = max burst size. Refill rate = sustained rate limit. Allows momentary bursts while preventing sustained overload. Popular in AWS API Gateway, Cloudflare.',
      },
      {
        title: 'Leaky Bucket Algorithm',
        content: 'Smooths out traffic by processing requests at constant rate.',
        eli5: 'Water drips out of a bucket at a steady rate. If water comes in too fast, the bucket overflows and excess is rejected.',
        technical: 'Fixed outflow rate regardless of inflow. Smooths bursty traffic. Often used for network traffic shaping. Simpler than token bucket but less flexible for bursts.',
      },
      {
        title: 'Sliding Window',
        content: 'Counts requests in a rolling time window for more accurate limiting.',
        eli5: 'Looking at your last 60 minutes of activity (not just "this hour") to see if you\'re over the limit.',
        technical: 'Weighted sliding window: track previous + current window. More accurate than fixed window (no reset spike). Higher memory cost. Implemented in Redis with sorted sets or time-series data.',
      },
      {
        title: 'Backpressure',
        content: 'Slowing down producers when consumers cannot keep up.',
        eli5: 'A factory line that slows down when the packaging station gets backed up.',
        technical: 'Reactive pattern. Consumer signals producer to slow down. Prevents: queue overflow, memory exhaustion. Implementations: TCP flow control, Reactive Streams, gRPC flow control. Alternative to dropping requests.',
      },
    ],
    terminology: [
      { term: 'Throttling', definition: 'Deliberately slowing down request rate' },
      { term: 'Circuit Breaker', definition: 'Stops requests to failing service to allow recovery' },
      { term: 'Quota', definition: 'Total resource allowance over a time period' },
      { term: 'Shedding', definition: 'Rejecting low-priority requests under load' },
    ],
    commonMistakes: [
      'Fixed window rate limiting causing burst at window boundary',
      'Rate limiting after expensive operations instead of before',
      'Not providing clear error messages about rate limit status',
      'Global rate limits that don\'t account for per-customer fairness',
      'No retry-after headers in rate limit responses',
    ],
    relatedTopics: ['async-jobs', 'noisy-neighbor', 'failure-handling'],
  },
  {
    id: 'distributed-locking',
    title: 'Distributed Locking & Coordination',
    category: 'distributed',
    concepts: [
      {
        title: 'Why Distributed Locks?',
        content: 'Ensure mutual exclusion when multiple processes might access shared resources.',
        eli5: 'Like a bathroom lock - only one person can use it at a time. When multiple people might try, we need a lock they all respect.',
        technical: 'Needed when: running the same job from multiple workers, ensuring singleton operations, preventing race conditions across servers. Alternatives: optimistic locking, idempotency where possible.',
      },
      {
        title: 'Redis-Based Locking (Redlock)',
        content: 'Using Redis SET with expiry for distributed locks.',
        eli5: 'Everyone agrees to check a specific bulletin board before doing a task. If someone\'s name is posted, others wait their turn.',
        technical: 'SET key value NX PX 30000 (atomic set if not exists with expiry). Redlock: acquire locks on majority of Redis instances. Auto-expiry prevents deadlocks. Risk: clock skew, process pause. Use for non-critical coordination.',
      },
      {
        title: 'Zookeeper/etcd Patterns',
        content: 'Using consensus-based systems for strong coordination guarantees.',
        eli5: 'A committee that votes on who gets to do what, with strict rules so everyone agrees.',
        technical: 'Provides: sequential nodes for queuing, ephemeral nodes (disappear on disconnect), watches for change notification. Stronger guarantees than Redis. Higher latency. Use for: leader election, distributed configuration, critical locks.',
      },
      {
        title: 'Lease-Based Locking',
        content: 'Locks with time-limited ownership that must be renewed.',
        eli5: 'Borrowing a library book - you can keep it for 2 weeks, but you can renew if you need more time.',
        technical: 'Lock holder must periodically renew lease (heartbeat). Automatic release on expiry. Prevents: process crashes holding locks forever. Implementation: background thread for renewal, fencing tokens for correctness.',
      },
    ],
    terminology: [
      { term: 'Fencing Token', definition: 'Monotonically increasing token to prevent stale lock holders' },
      { term: 'Deadlock', definition: 'Circular dependency where processes wait for each other' },
      { term: 'Livelock', definition: 'Processes keep changing state but make no progress' },
      { term: 'Leader Election', definition: 'Process of designating one node as coordinator' },
    ],
    commonMistakes: [
      'Not setting lock expiry - causes deadlocks on crashes',
      'Expiry too short - lock expires before work completes',
      'Not using fencing tokens - stale lock holder causes corruption',
      'Overusing locks when idempotency would suffice',
      'Not handling lock acquisition failures gracefully',
    ],
    relatedTopics: ['async-jobs', 'failure-handling', 'event-driven'],
  },
  {
    id: 'event-driven',
    title: 'Event-Driven Architecture',
    category: 'distributed',
    concepts: [
      {
        title: 'What is Event-Driven Architecture?',
        content: 'System design where components communicate through events rather than direct calls.',
        eli5: 'Like a school\'s bell system - the bell rings (event) and everyone who cares (students, teachers) reacts in their own way.',
        technical: 'Producers emit events, consumers subscribe. Decouples services - producer doesn\'t know consumers. Enables: async processing, multiple reactions to one event, temporal decoupling. Trade-off: harder to trace, eventual consistency.',
      },
      {
        title: 'Pub/Sub Patterns',
        content: 'Publishers broadcast events, subscribers receive relevant events.',
        eli5: 'Like subscribing to a newsletter - you only get topics you signed up for, and the sender doesn\'t need to know your address.',
        technical: 'Topics/channels organize events. Subscribers filter by topic. Implementations: AWS SNS/SQS, Google Pub/Sub, Redis Pub/Sub. Fan-out: one event, multiple subscribers. Each subscriber processes independently.',
      },
      {
        title: 'Event Sourcing',
        content: 'Store state changes as sequence of events rather than current state.',
        eli5: 'Instead of saving a document, you save every keystroke. You can replay the keystrokes to see the document at any point in time.',
        technical: 'Events are immutable, append-only. Current state = replay all events. Benefits: complete audit trail, time travel, easy to rebuild state. Challenges: schema evolution, query complexity, storage growth.',
      },
      {
        title: 'Kafka Concepts',
        content: 'Distributed event streaming platform for building event-driven systems.',
        eli5: 'A super-fast, durable conveyor belt system that can handle millions of items (events) per second and keep them organized.',
        technical: 'Topics: categories of events. Partitions: parallel processing within topic. Consumer groups: load balancing. Offsets: position in partition. Log compaction: keep latest per key. Exactly-once with transactions.',
      },
      {
        title: 'Ordering Guarantees',
        content: 'Understanding when and how event order is preserved.',
        eli5: 'Like a multi-lane highway - cars in the same lane stay in order, but cars in different lanes might pass each other.',
        technical: 'Kafka: ordering within partition only. Same key = same partition = ordered. Global ordering requires single partition (throughput limit). Trade-off: parallelism vs. ordering. Design keys carefully for partial ordering.',
      },
    ],
    terminology: [
      { term: 'Consumer Group', definition: 'Set of consumers sharing workload, each message to one consumer' },
      { term: 'Offset', definition: 'Position of consumer in partition log' },
      { term: 'Partition', definition: 'Ordered, immutable sequence of events' },
      { term: 'Compaction', definition: 'Retaining only latest event per key' },
      { term: 'Rebalancing', definition: 'Reassigning partitions when consumers join/leave group' },
    ],
    commonMistakes: [
      'Expecting global ordering without single partition',
      'Not handling duplicate events (at-least-once delivery)',
      'Overloading single event type with too many use cases',
      'No schema evolution strategy for events',
      'Ignoring consumer lag and rebalance impact',
    ],
    relatedTopics: ['async-jobs', 'idempotency', 'batch-vs-stream'],
  },

  // MULTI-TENANT SAAS ARCHITECTURE
  {
    id: 'tenant-isolation',
    title: 'Tenant Isolation Patterns',
    category: 'multi-tenant',
    concepts: [
      {
        title: 'What is Multi-Tenancy?',
        content: 'Architecture where single application instance serves multiple customers (tenants).',
        eli5: 'Like an apartment building - everyone shares the building (infrastructure) but has their own private apartment (data).',
        technical: 'Amortizes infrastructure costs across tenants. Challenges: data isolation, performance isolation, customization, compliance. Requires: tenant context in all operations, query filters, quota enforcement.',
      },
      {
        title: 'Shared Database, Shared Schema',
        content: 'All tenants share tables, differentiated by tenant_id column.',
        eli5: 'Like everyone\'s files in one big filing cabinet, but each folder is labeled with who owns it.',
        technical: 'Pros: highest density, simplest ops, easy to add tenants. Cons: noisy neighbor risk, query complexity (always filter by tenant_id), accidental cross-tenant queries. Mitigation: Row-level security (RLS), application-level enforcement.',
      },
      {
        title: 'Shared Database, Separate Schemas',
        content: 'Each tenant has own schema (PostgreSQL) or dataset (BigQuery) in shared database.',
        eli5: 'Everyone has their own section of the filing cabinet with a divider - better organization but still sharing the same room.',
        technical: 'Pros: better isolation than shared schema, schema customization per tenant. Cons: schema migrations complex, limited by database schema limits, some noisy neighbor risk. Use: 10s to 100s of tenants.',
      },
      {
        title: 'Separate Databases',
        content: 'Each tenant has dedicated database instance.',
        eli5: 'Everyone gets their own filing cabinet in their own room - maximum privacy and security.',
        technical: 'Pros: strongest isolation, independent scaling, easier compliance (data residency). Cons: higher cost, operational complexity, harder to query across tenants. Use: enterprise customers, regulated industries.',
      },
    ],
    terminology: [
      { term: 'Tenant Context', definition: 'Identifier passed through system to filter data/operations' },
      { term: 'RLS', definition: 'Row-Level Security - database enforces tenant filtering' },
      { term: 'Noisy Neighbor', definition: 'Tenant whose usage degrades performance for others' },
      { term: 'Tenant Sharding', definition: 'Distributing tenants across multiple database instances' },
    ],
    commonMistakes: [
      'Forgetting tenant_id filter in queries (data leak)',
      'No query timeout enforcement per tenant',
      'Shared schema without RLS or application enforcement',
      'Not planning migration path as tenants grow',
      'Mixing tenant isolation strategies without clear boundaries',
    ],
    relatedTopics: ['noisy-neighbor', 'rbac', 'config-management'],
  },
  {
    id: 'noisy-neighbor',
    title: 'Noisy Neighbor Problem',
    category: 'multi-tenant',
    concepts: [
      {
        title: 'What is Noisy Neighbor?',
        content: 'When one tenant\'s resource usage degrades performance for other tenants.',
        eli5: 'Like someone in an apartment playing loud music at 2 AM - their fun ruins everyone else\'s sleep.',
        technical: 'Shared resources: CPU, memory, disk I/O, network, database connections. One tenant\'s spike affects others. Especially problematic in shared-schema multi-tenancy. Requires monitoring and mitigation.',
      },
      {
        title: 'Detection',
        content: 'Identifying which tenant is causing performance issues.',
        eli5: 'Using a noise meter to figure out which apartment the loud music is coming from.',
        technical: 'Metrics: per-tenant query latency, CPU time, row counts, API call volume. Anomaly detection: sudden spikes, sustained high usage. Distributed tracing with tenant context. Dashboard per tenant for self-service visibility.',
      },
      {
        title: 'Per-Tenant Resource Quotas',
        content: 'Limiting each tenant\'s resource consumption.',
        eli5: 'Setting a maximum volume level for each apartment\'s sound system.',
        technical: 'Rate limiting: requests/second per tenant. Query limits: row scan limits, timeout enforcement. Connection pools: max connections per tenant. Storage quotas: max rows/GB per tenant. Enforce at application and infrastructure layers.',
      },
      {
        title: 'Fair Scheduling',
        content: 'Ensuring all tenants get fair share of resources.',
        eli5: 'A fair traffic light system where everyone waits their turn, not first-come-first-served.',
        technical: 'Weighted fair queuing: tenants with fewer active jobs get priority. Separate queue per tenant. Backoff for abusive tenants. Priority tiers (enterprise vs. free). Prevent one tenant monopolizing workers.',
      },
    ],
    terminology: [
      { term: 'Bulkhead', definition: 'Isolating resources to prevent cascade failures' },
      { term: 'Throttling', definition: 'Slowing down a tenant\'s requests' },
      { term: 'Circuit Breaker', definition: 'Stopping requests to overloaded resource' },
      { term: 'Fair Share', definition: 'Proportional resource allocation' },
    ],
    commonMistakes: [
      'No per-tenant observability - can\'t identify noisy neighbor',
      'Quotas too generous or not enforced',
      'Reactive instead of proactive quota enforcement',
      'Not communicating quota limits to users',
      'Global circuit breakers that punish all tenants',
    ],
    relatedTopics: ['tenant-isolation', 'rate-limiting', 'monitoring'],
  },
  {
    id: 'config-management',
    title: 'Configuration Management',
    category: 'multi-tenant',
    concepts: [
      {
        title: 'Why Per-Tenant Config?',
        content: 'Different customers need different features, limits, and customizations.',
        eli5: 'Like a restaurant with a menu - some customers are vegetarian, some allergic to nuts, some want spicy. You track their preferences.',
        technical: 'Feature flags, sync schedules, API credentials, webhooks, data retention policies. Needs: versioning, audit trail, validation, hot reload, hierarchical defaults.',
      },
      {
        title: 'Hierarchical Configuration',
        content: 'Cascading defaults from global → org → workspace → user.',
        eli5: 'Like house rules (global), your family rules (org), your room rules (workspace), and your personal rules (user) - more specific rules override general ones.',
        technical: 'Layers: system defaults < organization settings < workspace overrides < user preferences. Config resolution walks hierarchy. Override only what\'s needed. Implementation: nested maps, database with parent references.',
      },
      {
        title: 'Feature Flags',
        content: 'Runtime toggles to enable/disable features per tenant or cohort.',
        eli5: 'Light switches that can be turned on/off for different customers without redeploying the app.',
        technical: 'Types: release flags (gradual rollout), ops flags (kill switch), experiment flags (A/B test), permission flags (paid feature). Tools: LaunchDarkly, Unleash. Store: database, config service. Evaluate: at request time with caching.',
      },
      {
        title: 'Config Versioning',
        content: 'Tracking changes to configuration over time.',
        eli5: 'Like Google Docs version history - you can see what changed, when, and by whom.',
        technical: 'Append-only event log of changes. Each change: timestamp, user, before/after values. Enables: audit compliance, rollback, debugging ("what changed before the incident?"). Implementation: event sourcing, database triggers.',
      },
    ],
    terminology: [
      { term: 'Hot Reload', definition: 'Applying config changes without restart' },
      { term: 'Feature Flag', definition: 'Runtime toggle for features' },
      { term: 'Canary', definition: 'Gradual rollout to subset of users' },
      { term: 'Kill Switch', definition: 'Flag to instantly disable problematic feature' },
    ],
    commonMistakes: [
      'No validation on config changes - bad config crashes system',
      'Hardcoding feature checks instead of using flag framework',
      'Not cleaning up old feature flags after rollout complete',
      'No audit trail of who changed what when',
      'Config cached too aggressively - changes not reflected',
    ],
    relatedTopics: ['tenant-isolation', 'schema-evolution', 'monitoring'],
  },

  // ACCESS CONTROL & PERMISSIONS
  {
    id: 'rbac',
    title: 'RBAC (Role-Based Access Control)',
    category: 'access-control',
    concepts: [
      {
        title: 'What is RBAC?',
        content: 'Access control model where permissions are assigned to roles, and roles to users.',
        eli5: 'Like job titles at a company - a "Manager" role can approve expenses, a "Developer" role can deploy code. You assign job titles to people.',
        technical: 'Three entities: Users, Roles, Permissions. Users → Roles (many-to-many). Roles → Permissions (many-to-many). Check: user has role that includes permission. Simpler than direct user-permission assignment.',
      },
      {
        title: 'Roles and Permissions',
        content: 'Designing granular permissions and grouping them into roles.',
        eli5: 'Permissions are individual keys (open fridge, start car). Roles are keychains (homeowner has both keys, guest has only fridge key).',
        technical: 'Permissions: resource:action (e.g., sync:read, sync:write, sync:delete). Roles: collections of permissions (Admin, Editor, Viewer). Predefined roles + custom roles. Principle of least privilege.',
      },
      {
        title: 'Role Hierarchies',
        content: 'Roles can inherit permissions from other roles.',
        eli5: 'Like a ladder - a Senior Manager can do everything a Junior Manager can do, plus more.',
        technical: 'Parent-child role relationships. Child inherits parent permissions. Simplifies permission management. Implementation: graph traversal, denormalized permission sets. Watch out for: circular inheritance, deep hierarchies (slow).',
      },
      {
        title: 'Implementation Patterns',
        content: 'Common ways to implement RBAC in applications.',
        eli5: 'Different filing systems for organizing who can do what.',
        technical: 'Database: user_roles, role_permissions tables. Check: JOIN query or preload user permissions. Middleware: inject permissions into request context. Cache: user permissions rarely change. Enforce: at API layer, never trust client.',
      },
    ],
    terminology: [
      { term: 'Principal', definition: 'Entity (user, service) requesting access' },
      { term: 'Permission', definition: 'Ability to perform action on resource' },
      { term: 'Role', definition: 'Named collection of permissions' },
      { term: 'Assignment', definition: 'Granting role to user' },
    ],
    commonMistakes: [
      'Too many fine-grained permissions - complexity explosion',
      'Hardcoding permission checks instead of data-driven',
      'Not caching user permissions (query on every request)',
      'Allowing client to specify permissions (must check server-side)',
      'No way to audit who has access to what',
    ],
    relatedTopics: ['abac', 'zanzibar', 'multi-tenant-permissions'],
  },
  {
    id: 'abac',
    title: 'ABAC (Attribute-Based Access Control)',
    category: 'access-control',
    concepts: [
      {
        title: 'What is ABAC?',
        content: 'Access decisions based on attributes of user, resource, and environment.',
        eli5: 'Like a smart door that looks at multiple things before letting you in: Who you are, what time it is, where you\'re coming from, what you\'re carrying.',
        technical: 'Evaluates policies against attributes: subject (user role, department), resource (classification, owner), action (read, write), environment (time, location, IP). More flexible than RBAC but more complex.',
      },
      {
        title: 'When RBAC Isn\'t Enough',
        content: 'Scenarios requiring dynamic, context-aware access control.',
        eli5: 'RBAC says "Managers can approve expenses." ABAC says "Managers can approve expenses under $1000, in their department, during business hours."',
        technical: 'Use ABAC when: need temporal restrictions, data classification, ownership-based access, environmental factors (IP, location), complex business rules. Example: "Can edit if owner OR (editor role AND document not locked)".',
      },
      {
        title: 'Policy-Based Decisions',
        content: 'Defining and evaluating access policies.',
        eli5: 'Like a recipe book - each recipe (policy) has conditions (ingredients) and a result (allow/deny).',
        technical: 'Policy languages: XACML, Rego (Open Policy Agent), custom DSL. Policy: IF (user.dept == resource.dept AND user.role == "manager") THEN allow. Evaluate: PDP (Policy Decision Point) returns allow/deny. PEP (Policy Enforcement Point) enforces.',
      },
      {
        title: 'Performance Considerations',
        content: 'ABAC evaluation can be slower than RBAC lookups.',
        eli5: 'Simple role check is like checking if you\'re on a list. ABAC is like answering a quiz before entering.',
        technical: 'Mitigations: cache policy decisions, precompute where possible, index attributes, limit policy complexity. Tools: OPA (in-memory policy evaluation), AWS Cedar. Trade-off: flexibility vs. latency.',
      },
    ],
    terminology: [
      { term: 'PDP', definition: 'Policy Decision Point - evaluates policies' },
      { term: 'PEP', definition: 'Policy Enforcement Point - enforces decisions' },
      { term: 'Policy', definition: 'Rules combining attributes to allow/deny' },
      { term: 'Attribute', definition: 'Property of subject, resource, or environment' },
    ],
    commonMistakes: [
      'Using ABAC when simple RBAC would suffice',
      'Policies too complex - hard to reason about and debug',
      'Not caching policy decisions',
      'Policies scattered across codebase instead of centralized',
      'No testing framework for policies',
    ],
    relatedTopics: ['rbac', 'zanzibar', 'multi-tenant-permissions'],
  },
  {
    id: 'zanzibar',
    title: 'Google Zanzibar Model',
    category: 'access-control',
    concepts: [
      {
        title: 'What is Zanzibar?',
        content: 'Google\'s planet-scale authorization system based on relationship tuples.',
        eli5: 'Instead of asking "What can Alice do?" ask "What is Alice\'s relationship to this document?" Relationships determine permissions.',
        technical: 'Stores relationship tuples: (object, relation, subject). Example: (doc:123, viewer, user:alice). Three operations: Write (store tuple), Check (has permission?), Expand (who has access?). Powers Google Drive, Calendar, etc.',
      },
      {
        title: 'Tuple Structure',
        content: 'Understanding the (object, relation, subject) model.',
        eli5: 'Like a sentence: "Alice (subject) is a viewer (relation) of Document123 (object)."',
        technical: 'Object: resource being accessed (doc:123, folder:456). Relation: role/permission (owner, editor, viewer). Subject: user or group (user:alice, group:eng). Tuple: (doc:123, viewer, user:alice). Indirection: (doc:123, viewer, group:eng#member).',
      },
      {
        title: 'Check Operation',
        content: 'Determining if a user has permission via relationship graph traversal.',
        eli5: 'Walking through connections to see if there\'s a path from Alice to the permission she needs.',
        technical: 'Query: Check(doc:123, view, user:alice). Expansion: alice is viewer? OR alice is editor? OR alice is owner? Recursive: alice member of group that\'s viewer? Returns: boolean + zookie (consistency token).',
      },
      {
        title: 'Consistency Requirements',
        content: 'Zanzibar provides external consistency for authorization.',
        eli5: 'If Alice is granted access and immediately tries to use it, it works - no "wait for sync" lag.',
        technical: 'Zookies: tokens encoding timestamp of check. Ensures: if permission granted at t1, check at t2 > t1 sees it. Implementation: distributed snapshots, versioned tuples. Critical for UX: grant access → immediately works.',
      },
    ],
    terminology: [
      { term: 'Tuple', definition: '(object, relation, subject) relationship triple' },
      { term: 'Zookie', definition: 'Consistency token for check operations' },
      { term: 'Userset', definition: 'Set of users with a relation to an object' },
      { term: 'Rewrite', definition: 'Rule defining relation in terms of other relations' },
    ],
    commonMistakes: [
      'Creating too many tuples - explosion with large groups',
      'Not using indirection for groups (duplicating tuples per user)',
      'Ignoring consistency model - stale permission checks',
      'No namespace separation for different resource types',
      'Overly complex relation rewrites - performance impact',
    ],
    relatedTopics: ['rbac', 'abac', 'multi-tenant-permissions'],
  },
  {
    id: 'multi-tenant-permissions',
    title: 'Multi-Tenant Permission Modeling',
    category: 'access-control',
    concepts: [
      {
        title: 'Workspaces and Resources',
        content: 'Modeling permissions across organizational boundaries.',
        eli5: 'Like buildings (workspaces) with rooms (resources). Some people can access only certain rooms, and some can enter from multiple buildings.',
        technical: 'Hierarchy: Org → Workspace → Resource. User membership at workspace level. Permissions at resource level. Workspace-level roles (Admin, Member) + resource-level roles (Owner, Editor, Viewer).',
      },
      {
        title: 'Cross-Workspace Sharing',
        content: 'Allowing resources to be shared outside their workspace.',
        eli5: 'Letting your neighbor (from a different apartment) borrow your lawnmower - temporary access to a specific item.',
        technical: 'Share resource to: specific user, specific workspace, public link. Permission: maintain separate access list per resource. Revocation: remove share entry. Audit: track cross-workspace access.',
      },
      {
        title: 'Permission Inheritance',
        content: 'Resources inherit permissions from parent containers.',
        eli5: 'If you can enter the building, you can enter any room unless a room has a special lock.',
        technical: 'Workspace members inherit base permissions. Explicit resource permissions override. Calculation: workspace perms + resource perms, take highest. Watch: permission removal must check both levels.',
      },
      {
        title: 'Implementation Approaches',
        content: 'Denormalized vs. computed permissions.',
        eli5: 'Denormalized: write down who can access each room. Computed: calculate it from building + room rules every time.',
        technical: 'Denormalized: store flattened permissions per resource. Fast reads, slower writes, eventual consistency. Computed: calculate at check time. Slow reads, simpler writes, always consistent. Hybrid: cache computed results.',
      },
    ],
    terminology: [
      { term: 'Workspace', definition: 'Container for related resources and team members' },
      { term: 'Inheritance', definition: 'Deriving permissions from parent objects' },
      { term: 'Share', definition: 'Granting access outside normal hierarchy' },
      { term: 'Principal', definition: 'User or service account requesting access' },
    ],
    commonMistakes: [
      'Not filtering resources by workspace in queries (data leak)',
      'Complex inheritance logic without clear documentation',
      'No way to audit effective permissions for debugging',
      'Sharing without expiration or revocation mechanism',
      'Performance: N+1 queries checking permissions per resource',
    ],
    relatedTopics: ['rbac', 'zanzibar', 'tenant-isolation'],
  },

  // RELIABILITY & OBSERVABILITY
  {
    id: 'retry-strategies',
    title: 'Retry Strategies',
    category: 'reliability',
    concepts: [
      {
        title: 'Why Retry?',
        content: 'Transient failures are common in distributed systems. Retries improve reliability.',
        eli5: 'Sometimes your Wi-Fi hiccups. Instead of giving up after one try, you try again and usually it works.',
        technical: 'Network blips, rate limits, temporary overload. Retrying increases success rate. But: must be idempotent, respect backoff, limit attempts. Not all errors should retry (401, 403, 404).',
      },
      {
        title: 'Exponential Backoff',
        content: 'Increasing delay between retries: 1s, 2s, 4s, 8s...',
        eli5: 'If a restaurant is full, you don\'t go back immediately. You wait 10 min, then 20 min, then 40 min before trying again.',
        technical: 'delay = base_delay * (2 ^ attempt). Prevents: overwhelming already-struggling service. Max backoff cap (e.g., 60s). Common in AWS SDK, gRPC, HTTP clients.',
      },
      {
        title: 'Jitter',
        content: 'Adding randomness to backoff to prevent thundering herd.',
        eli5: 'If 1000 people all wait exactly 10 seconds to retry, they all slam the door at once. Random delays spread out the load.',
        technical: 'delay = random(0, exponential_backoff). Or: delay = exponential_backoff * random(0.5, 1.5). Prevents synchronized retries. Critical for high-scale systems.',
      },
      {
        title: 'Retry Budgets',
        content: 'Limiting total retries to prevent retry storms.',
        eli5: 'You only get 3 "do-overs" per game. Use them wisely.',
        technical: 'Track: retries / total_requests. If ratio exceeds threshold (e.g., 10%), stop retrying. Prevents: retries consuming more resources than original requests. Fail fast when system is genuinely down.',
      },
      {
        title: 'Non-Retryable Errors',
        content: 'Some errors should never be retried.',
        eli5: 'If you\'re not on the guest list, asking 10 times won\'t help. But if the bouncer is busy, waiting a bit might work.',
        technical: 'Don\'t retry: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found). Do retry: 429 (rate limit), 500 (server error), 502/503 (bad gateway/unavailable), timeouts, network errors.',
      },
    ],
    terminology: [
      { term: 'Transient Failure', definition: 'Temporary error that may succeed if retried' },
      { term: 'Thundering Herd', definition: 'Many clients retrying simultaneously' },
      { term: 'Backoff', definition: 'Delay before retry attempt' },
      { term: 'Circuit Open', definition: 'Stopped retrying to allow recovery' },
    ],
    commonMistakes: [
      'Retrying without exponential backoff',
      'No jitter - causing thundering herd',
      'Retrying non-idempotent operations without safeguards',
      'Infinite retries - never failing fast',
      'Retrying 4xx errors (client errors that won\'t succeed)',
    ],
    relatedTopics: ['idempotency', 'circuit-breaker', 'rate-limiting'],
  },
  {
    id: 'circuit-breaker',
    title: 'Failure Handling Patterns',
    category: 'reliability',
    concepts: [
      {
        title: 'Circuit Breaker Pattern',
        content: 'Automatically stop calling failing service to allow it to recover.',
        eli5: 'Like a circuit breaker in your house - if there\'s a problem, it shuts off power so the problem doesn\'t get worse.',
        technical: 'States: Closed (normal), Open (failing, stop requests), Half-Open (testing recovery). Closed → Open: after N failures. Open → Half-Open: after timeout. Half-Open → Closed: after M successes.',
      },
      {
        title: 'Bulkhead Pattern',
        content: 'Isolate resources to prevent cascade failures.',
        eli5: 'A ship has watertight compartments - if one floods, it doesn\'t sink the whole ship.',
        technical: 'Separate: thread pools, connection pools, rate limits per dependency. One failing service doesn\'t exhaust all threads. Example: 10 threads for Service A, 10 for Service B, so A failure doesn\'t block B calls.',
      },
      {
        title: 'Timeouts and Deadlines',
        content: 'Limit how long to wait for operations.',
        eli5: 'Don\'t wait on hold forever - if customer service doesn\'t answer in 5 minutes, hang up and try again later.',
        technical: 'Set timeout on: HTTP requests, database queries, RPC calls. Timeout < than caller\'s timeout (avoid cascading). Use deadline propagation (gRPC). Fail fast better than indefinite hang.',
      },
      {
        title: 'Graceful Degradation',
        content: 'Continue operating with reduced functionality when dependencies fail.',
        eli5: 'If your GPS stops working, you can still drive using street signs - not ideal but keeps you moving.',
        technical: 'Fallbacks: cached data, default values, reduced features. Example: recommendations down → show popular items. Monitoring: track degraded mode usage. Don\'t degrade silently - alert users.',
      },
    ],
    terminology: [
      { term: 'Cascade Failure', definition: 'Failure in one component triggering failures in others' },
      { term: 'Fail Fast', definition: 'Quickly return error instead of waiting/retrying' },
      { term: 'Fallback', definition: 'Alternative behavior when primary fails' },
      { term: 'Deadline', definition: 'Absolute time by which operation must complete' },
    ],
    commonMistakes: [
      'No timeout on external calls - hanging forever',
      'Circuit breaker threshold too sensitive - unnecessary failures',
      'Not monitoring circuit breaker state - unaware of issues',
      'Shared resource pools - no bulkhead isolation',
      'Graceful degradation without user notification',
    ],
    relatedTopics: ['retry-strategies', 'rate-limiting', 'monitoring'],
  },
  {
    id: 'monitoring',
    title: 'Monitoring & Alerting',
    category: 'reliability',
    concepts: [
      {
        title: 'Key Metrics for Data Pipelines',
        content: 'What to measure in data sync and processing systems.',
        eli5: 'Like a car dashboard - you need to know: speed (throughput), fuel (resources), engine temp (errors), odometer (volume processed).',
        technical: 'Metrics: rows processed/sec, error rate, latency (p50, p95, p99), queue depth, success/failure counts. Per-tenant metrics. Dashboards: real-time + historical trends.',
      },
      {
        title: 'SLIs, SLOs, SLAs',
        content: 'Defining and measuring service reliability.',
        eli5: 'SLI (indicator): your actual grade. SLO (objective): your goal (B+ or better). SLA (agreement): the consequences if you fail (lose scholarship).',
        technical: 'SLI: measurable metric (e.g., 99.5% of requests < 200ms). SLO: target value (99.9% uptime). SLA: contractual agreement with penalties. Error budgets: (100% - SLO) = allowed downtime. Burn rate: how fast consuming error budget.',
      },
      {
        title: 'Dashboarding Best Practices',
        content: 'Effective visualization of system health.',
        eli5: 'A good dashboard is like a pilot\'s cockpit - everything you need at a glance, nothing extra.',
        technical: 'RED method: Rate (requests/sec), Errors (error rate), Duration (latency). USE method: Utilization, Saturation, Errors. Organize: overview → drill-down. Color: green (good), yellow (warning), red (critical). Real-time + historical.',
      },
      {
        title: 'Alerting Strategy',
        content: 'When and how to notify humans.',
        eli5: 'Good alerts are like smoke alarms - they go off for fires (real problems), not for burnt toast (false alarms).',
        technical: 'Alert on: symptoms (customers affected) not causes (disk usage). Actionable: clear what to do. Severity levels: P0 (page immediately), P1 (next business day), P2 (ticket). Avoid: alert fatigue, flapping, duplicate alerts. Use: dead man\'s switch.',
      },
    ],
    terminology: [
      { term: 'SLI', definition: 'Service Level Indicator - measurable metric' },
      { term: 'SLO', definition: 'Service Level Objective - target for SLI' },
      { term: 'SLA', definition: 'Service Level Agreement - contract with penalties' },
      { term: 'Error Budget', definition: 'Allowed failure before violating SLO' },
    ],
    commonMistakes: [
      'Too many alerts - alert fatigue',
      'Alerting on every anomaly instead of customer impact',
      'No runbooks - alerts without context/action',
      'Same alert severity for everything',
      'Monitoring system but not per-tenant metrics',
    ],
    relatedTopics: ['circuit-breaker', 'noisy-neighbor', 'schema-evolution'],
  },
  {
    id: 'schema-evolution',
    title: 'Schema Evolution & Migration',
    category: 'reliability',
    concepts: [
      {
        title: 'Why Schema Evolution Matters',
        content: 'Databases and APIs change over time. Handling this safely is critical.',
        eli5: 'Like remodeling a house while people are living in it - you can\'t just knock down walls without planning.',
        technical: 'Schema changes: add/remove/rename columns, change types, add indexes. Impact: running queries, client compatibility, data pipelines. Need: backward compatibility, zero-downtime migrations.',
      },
      {
        title: 'Backward/Forward Compatibility',
        content: 'New code works with old schema, old code works with new schema.',
        eli5: 'Backward: new DVD player plays old DVDs. Forward: old DVD player plays new DVDs (if possible).',
        technical: 'Backward (easier): new code reads old format. Add optional fields, don\'t remove required fields. Forward (harder): old code reads new format. Use defaults for new fields. Critical for rolling deployments.',
      },
      {
        title: 'Safe Migration Patterns',
        content: 'Techniques for zero-downtime schema changes.',
        eli5: 'Building a new bridge next to the old one, switching traffic, then removing the old bridge.',
        technical: 'Expand/Contract: (1) Add new column, (2) Dual-write both columns, (3) Backfill old data, (4) Switch reads to new column, (5) Remove old column. Each step is independently deployable. Locks: avoid long-running ALTER TABLE.',
      },
      {
        title: 'Handling Breaking Changes',
        content: 'When incompatible changes are necessary.',
        eli5: 'Like switching from VHS to DVD - you need to tell everyone, give them time to prepare, and provide adapters.',
        technical: 'Versioning: API v1 vs v2. Deprecation timeline: announce, mark deprecated, provide migration path, sunset. Data: export old format, migrate, import new format. Notify affected tenants, provide self-service migration tools.',
      },
    ],
    terminology: [
      { term: 'DDL', definition: 'Data Definition Language - schema changes (CREATE, ALTER, DROP)' },
      { term: 'Backfill', definition: 'Populating new column with data from existing columns' },
      { term: 'Dual-Write', definition: 'Writing to both old and new schema during migration' },
      { term: 'Deprecation', definition: 'Marking feature/API for eventual removal' },
    ],
    commonMistakes: [
      'Renaming columns without multi-phase migration (breaks running code)',
      'Dropping columns without ensuring no code references them',
      'Long-running migrations that lock tables',
      'No rollback plan for failed migrations',
      'Not communicating schema changes to downstream consumers',
    ],
    relatedTopics: ['cdc', 'monitoring', 'config-management'],
  },

  // STORAGE & DATABASES
  {
    id: 'database-selection',
    title: 'Database Selection',
    category: 'storage',
    concepts: [
      {
        title: 'SQL vs. NoSQL',
        content: 'Choosing between relational and non-relational databases.',
        eli5: 'SQL is like a filing cabinet with strict rules - everything in its place. NoSQL is like a junk drawer - flexible but harder to find specific things.',
        technical: 'SQL (Postgres, MySQL): ACID, joins, schema. NoSQL (Mongo, DynamoDB): flexible schema, horizontal scaling, eventual consistency. Use SQL when: complex relationships, transactions, consistency. Use NoSQL when: scale, flexible schema, simple access patterns.',
      },
      {
        title: 'OLTP vs. OLAP',
        content: 'Transactional vs. analytical workloads.',
        eli5: 'OLTP: cash register (fast, many small transactions). OLAP: year-end report (slow, analyze lots of data).',
        technical: 'OLTP: row-store, indexed, many writes, low latency (Postgres, MySQL). OLAP: column-store, compressed, batch analytics, high throughput (Snowflake, BigQuery). Don\'t run heavy analytics on OLTP database.',
      },
      {
        title: 'Postgres vs. Redis vs. DynamoDB',
        content: 'When to use each.',
        eli5: 'Postgres: main storage (like a warehouse). Redis: quick access (like a front counter). DynamoDB: massive scale (like a distributed warehouse).',
        technical: 'Postgres: structured data, relationships, transactions, <10TB. Redis: cache, sessions, pub/sub, ephemeral data. DynamoDB: key-value, unpredictable traffic, serverless, infinite scale. Multi-database architectures common.',
      },
      {
        title: 'Read vs. Write Optimization',
        content: 'Some databases optimize for reads, others for writes.',
        eli5: 'Read-optimized: library (easy to find books). Write-optimized: logging system (easy to add entries).',
        technical: 'Read-heavy: denormalize, materialized views, read replicas, aggressive caching. Write-heavy: append-only logs, batch writes, async processing, sharding. Measure your workload before optimizing.',
      },
    ],
    terminology: [
      { term: 'ACID', definition: 'Atomicity, Consistency, Isolation, Durability - transaction guarantees' },
      { term: 'Eventual Consistency', definition: 'System becomes consistent over time, not immediately' },
      { term: 'Sharding', definition: 'Partitioning data across multiple database instances' },
      { term: 'Read Replica', definition: 'Copy of database for read-only queries' },
    ],
    commonMistakes: [
      'Using NoSQL because "it scales" without understanding trade-offs',
      'Running analytics on production OLTP database',
      'Not considering access patterns before choosing database',
      'Choosing based on popularity instead of requirements',
      'Ignoring cost implications of cloud database choices',
    ],
    relatedTopics: ['caching', 'data-modeling', 'data-warehouse'],
  },
  {
    id: 'caching',
    title: 'Caching Strategies',
    category: 'storage',
    concepts: [
      {
        title: 'Why Cache?',
        content: 'Reduce latency and load on expensive resources.',
        eli5: 'Keeping frequently-used items on your desk instead of walking to the filing cabinet every time.',
        technical: 'Cache: fast but limited storage (Redis, Memcached) in front of slow but large storage (database, API). Hit rate: % of requests served from cache. Goal: high hit rate, low staleness.',
      },
      {
        title: 'Cache-Aside (Lazy Loading)',
        content: 'Application checks cache, fetches from DB on miss, then stores in cache.',
        eli5: 'Check your desk drawer first. If not there, go to filing cabinet, make a copy, put copy in drawer.',
        technical: 'Read: if cache hit, return; else fetch from DB, store in cache, return. Write: update DB, optionally invalidate cache. Pros: only caches what\'s needed. Cons: cache misses slow, initial load uncached.',
      },
      {
        title: 'Write-Through',
        content: 'Writes go through cache to database.',
        eli5: 'Every time you update the filing cabinet, you also update your desk drawer copy.',
        technical: 'Write: update cache, then update DB (synchronously). Read: always check cache. Pros: cache always fresh. Cons: writes slower (extra cache write), caches unused data.',
      },
      {
        title: 'Write-Behind (Write-Back)',
        content: 'Writes go to cache, asynchronously flushed to database.',
        eli5: 'Update your desk copy immediately, and once a day transfer all updates to the filing cabinet.',
        technical: 'Write: update cache, queue DB write. Background job flushes queue. Pros: fast writes. Cons: data loss risk if cache fails, complexity, eventual consistency.',
      },
      {
        title: 'Cache Invalidation',
        content: 'Hardest problem in computer science.',
        eli5: 'Knowing when your desk copy is outdated and needs to be refreshed.',
        technical: 'TTL: expire after time. Event-based: invalidate on write. Pattern-based: delete all keys matching pattern. Versioning: include version in key. Trade-off: freshness vs. hit rate.',
      },
      {
        title: 'Cache Stampede Prevention',
        content: 'Avoiding thundering herd on cache miss.',
        eli5: 'When the popular item is out of stock, you don\'t want 1000 people running to the warehouse at once.',
        technical: 'Problem: cache expires, many requests simultaneously miss, all query DB. Solutions: stale-while-revalidate (serve stale while one request refreshes), distributed lock (one requester rebuilds), probabilistic early expiration.',
      },
    ],
    terminology: [
      { term: 'Hit Rate', definition: '% of requests served from cache without DB lookup' },
      { term: 'TTL', definition: 'Time To Live - duration before cache entry expires' },
      { term: 'Eviction', definition: 'Removing entries from cache (LRU, LFU)' },
      { term: 'Cold Cache', definition: 'Empty cache after restart/deployment' },
    ],
    commonMistakes: [
      'No TTL - stale data served forever',
      'TTL too short - low hit rate, high DB load',
      'Not handling cache stampede on expiration',
      'Caching before measuring if needed',
      'Caching user-specific data globally (privacy issue)',
    ],
    relatedTopics: ['database-selection', 'rate-limiting', 'distributed-locking'],
  },
  {
    id: 'data-modeling',
    title: 'Data Modeling',
    category: 'storage',
    concepts: [
      {
        title: 'Normalization vs. Denormalization',
        content: 'Trade-off between data integrity and query performance.',
        eli5: 'Normalized: one truth, many references (address book with one entry per person). Denormalized: copy info everywhere (write address on every letter).',
        technical: 'Normalization: eliminate redundancy, avoid update anomalies, enforce referential integrity. Denormalization: faster reads (no joins), but update complexity. OLTP: normalize. OLAP/caches: denormalize.',
      },
      {
        title: 'Indexing Strategies',
        content: 'Creating indexes to speed up queries.',
        eli5: 'Like a book index - instead of reading every page to find a topic, you look it up in the index.',
        technical: 'B-tree indexes: default, good for equality and range. Hash indexes: exact match only. Composite: multi-column. Partial: filter condition. Trade-off: faster reads, slower writes, storage overhead. Index on: WHERE, JOIN, ORDER BY columns.',
      },
      {
        title: 'Partitioning and Sharding',
        content: 'Splitting large tables for performance and scale.',
        eli5: 'Splitting a giant phone book into multiple volumes (A-M, N-Z).',
        technical: 'Partitioning: logical split within one DB (by date, range, hash). Sharding: physical split across databases. Benefits: parallel processing, smaller indexes. Challenges: cross-partition queries, rebalancing, hotspots.',
      },
      {
        title: 'Schema Design Patterns',
        content: 'Common patterns for modeling relationships.',
        eli5: 'Different ways to organize your filing system depending on what you need to find.',
        technical: 'One-to-many: foreign key. Many-to-many: junction table. Polymorphic: type + id. JSONB: semi-structured. Time-series: partitioned by timestamp. Event sourcing: append-only log. Choose based on access patterns.',
      },
    ],
    terminology: [
      { term: 'Foreign Key', definition: 'Column referencing primary key in another table' },
      { term: 'Cardinality', definition: 'Number of unique values in column' },
      { term: 'Selectivity', definition: 'Ratio of unique values to total rows' },
      { term: 'Hot Partition', definition: 'Partition receiving disproportionate load' },
    ],
    commonMistakes: [
      'Over-indexing - slows down writes, wastes space',
      'Under-indexing - slow queries',
      'Ignoring query patterns when designing schema',
      'Premature denormalization before measuring',
      'Not planning for schema evolution from day one',
    ],
    relatedTopics: ['database-selection', 'caching', 'data-warehouse'],
  },
]
