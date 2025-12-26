export interface InterviewFramework {
  id: string
  name: string
  description: string
  steps: {
    step: number
    name: string
    duration: string
    description: string
    tips: string[]
    example?: string
  }[]
}

export interface StudyTechnique {
  id: string
  name: string
  description: string
  whenToUse: string
  howToApply: string[]
  example?: string
}

export interface CommonPattern {
  id: string
  name: string
  description: string
  useCases: string[]
  keyComponents: string[]
  tradeoffs: {
    pros: string[]
    cons: string[]
  }
}

export interface BackOfEnvelopeCalculation {
  id: string
  name: string
  description: string
  formula: string
  example: {
    scenario: string
    calculation: string
    result: string
  }
}

// Hello Interview's Delivery Framework (adapted)
export const interviewFramework: InterviewFramework = {
  id: 'hello-interview-framework',
  name: 'System Design Interview Framework',
  description: 'A structured 45-minute approach to system design interviews, focusing on demonstrating depth of knowledge while covering all key areas.',
  steps: [
    {
      step: 1,
      name: 'Understand the Problem',
      duration: '5-7 minutes',
      description: 'Clarify requirements and scope. Separate functional requirements (what the system does) from non-functional requirements (how it operates).',
      tips: [
        'Ask clarifying questions if unfamiliar with the product',
        'Focus on top 3-4 core features, don\'t get distracted by bells and whistles',
        'Identify what\'s "below the line" (out of scope) and confirm with interviewer',
        'Consider read-to-write ratio (e.g., URL shortener is 1000:1 reads to writes)',
        'Frame non-functional requirements as specific benchmarks (e.g., 100M DAU, <200ms latency)',
      ],
      example: 'Functional: Users submit long URL → receive short URL. Users access short URL → redirect to original. Non-functional: Unique codes, <100ms redirects, 99.99% availability, 1B URLs, 100M DAU.',
    },
    {
      step: 2,
      name: 'Define Core Entities & API',
      duration: '3-5 minutes',
      description: 'Identify the main data entities and design the API contract between client and server.',
      tips: [
        'Start with a simple list of entities, don\'t detail columns yet',
        'Map each functional requirement to an API endpoint',
        'Use REST conventions: POST (create), GET (read), PUT (update), DELETE (delete)',
        'Tell interviewer your plan: "I\'ll start simple, then detail the data model later"',
        'Consider which HTTP status codes to return',
      ],
      example: 'Entities: OriginalURL, ShortURL, User. API: POST /urls (create short), GET /{short_code} (redirect). Return 302 for temporary redirect (allows analytics tracking).',
    },
    {
      step: 3,
      name: 'High-Level Design',
      duration: '10-15 minutes',
      description: 'Design a basic working system that satisfies functional requirements. Draw the architecture diagram.',
      tips: [
        'Go through functional requirements one-by-one',
        'Start with the simplest architecture that works',
        'Abstract complex parts: "For now, assume a magic function generates the short code"',
        'Draw Client → Server → Database flow',
        'Explain each component\'s role as you add it',
        'Validate the design handles basic flows before optimizing',
      ],
      example: 'Client → Primary Server (validates URL, generates short code) → Database (stores mapping). For redirects: lookup short code, return 302 redirect.',
    },
    {
      step: 4,
      name: 'Deep Dives',
      duration: '15-20 minutes',
      description: 'Address non-functional requirements. Dive deep into 2-3 technical challenges. Show multiple solution approaches.',
      tips: [
        'Review non-functional requirements and identify gaps',
        'Present multiple solutions: Bad → Good → Great',
        'Explain trade-offs for each approach',
        'Do back-of-envelope calculations to justify decisions',
        'Common deep dives: uniqueness, scaling reads, scaling writes, availability',
        'Let interviewer guide which topics to explore',
      ],
      example: 'Deep dive: "How to ensure unique short codes?" Bad: prefix of long URL. Great: Hash function (MD5 → base62) or Counter + base62 encoding.',
    },
    {
      step: 5,
      name: 'Final Design & Wrap-up',
      duration: '5 minutes',
      description: 'Summarize the complete architecture. Address remaining questions. Discuss future improvements.',
      tips: [
        'Walk through the final architecture diagram',
        'Summarize key decisions and their rationale',
        'Mention what you\'d add with more time',
        'Be ready for follow-up questions on any component',
        'Discuss monitoring, alerting, and operational concerns',
      ],
      example: 'Final: Load Balancer → Read/Write Services (separated for scale) → Redis Cache (popular URLs) → Postgres DB. Counter in Redis for unique IDs with batching.',
    },
  ],
}

export const studyTechniques: StudyTechnique[] = [
  {
    id: 'read-write-ratio',
    name: 'Read-to-Write Ratio Analysis',
    description: 'Identify the balance between read and write operations to guide architecture decisions.',
    whenToUse: 'At the start of every system design problem, during requirements gathering.',
    howToApply: [
      'Ask: "For every write, how many reads will there be?"',
      'URL Shortener: 1000:1 (read-heavy) → optimize for reads with caching',
      'Social Media Feed: 100:1 (read-heavy) → pre-compute feeds, cache aggressively',
      'Chat System: 1:1 (balanced) → optimize both paths equally',
      'Logging System: 1:100 (write-heavy) → optimize for write throughput, batch reads',
    ],
    example: 'URL Shortener: 100M DAU, each user clicks 10 links/day = 1B reads/day. 100K new URLs created/day = 100K writes/day. Ratio = 10,000:1 reads to writes.',
  },
  {
    id: 'back-of-envelope',
    name: 'Back-of-Envelope Calculations',
    description: 'Quick estimates to validate design decisions and identify bottlenecks.',
    whenToUse: 'When justifying database choice, cache size, storage requirements, or server capacity.',
    howToApply: [
      'Know your numbers: 1 day = 86,400 sec ≈ 100K sec, 1 year ≈ 32M sec',
      'Storage: estimate bytes per record × number of records',
      'QPS: daily requests ÷ 86,400 (or ÷ 100K for simplicity)',
      'Round aggressively: 500 bytes → 1KB, 86,400 → 100,000',
      'State assumptions explicitly: "Assuming 500 bytes per URL mapping..."',
    ],
    example: 'URL Shortener storage: 500 bytes/row × 1B rows = 500GB. This fits on a single modern SSD, so sharding not required for storage.',
  },
  {
    id: 'trade-off-analysis',
    name: 'Trade-off Analysis',
    description: 'Evaluate multiple solutions by comparing pros and cons systematically.',
    whenToUse: 'When presenting solutions in deep dives, or when interviewer asks "why this approach?"',
    howToApply: [
      'Present 2-3 approaches: typically Bad → Good → Great',
      'For each, explain: how it works, advantages, disadvantages',
      'Consider: complexity, performance, cost, operational overhead',
      'Make a clear recommendation with rationale',
      'Acknowledge when "it depends" and explain the factors',
    ],
    example: 'Short URL generation: Bad (URL prefix) - not unique. Good (hash function) - unique but collision possible. Great (counter + base62) - guaranteed unique, short, but needs coordination.',
  },
  {
    id: 'scaling-patterns',
    name: 'Scaling Pattern Recognition',
    description: 'Recognize common scaling patterns and apply them appropriately.',
    whenToUse: 'During deep dives when addressing scalability requirements.',
    howToApply: [
      'Read scaling: add cache (Redis), read replicas, CDN for static content',
      'Write scaling: sharding, message queues, eventual consistency',
      'Compute scaling: horizontal scaling with load balancer, stateless services',
      'Storage scaling: blob storage (S3) for large files, partitioning for databases',
      'Always consider: what\'s the bottleneck? Scale that component.',
    ],
    example: 'URL Shortener reads: Cache popular URLs in Redis (80/20 rule). Read replicas for DB. CDN for static landing pages. This handles 10,000:1 read ratio.',
  },
  {
    id: 'failure-mode-analysis',
    name: 'Failure Mode Analysis',
    description: 'Consider what happens when components fail and design for resilience.',
    whenToUse: 'When discussing availability requirements or when interviewer asks "what if X fails?"',
    howToApply: [
      'For each critical component, ask: "What happens if this fails?"',
      'Database: replication, failover, backups',
      'Cache: fail-open (allow requests) vs fail-closed (block requests)',
      'Service: health checks, circuit breakers, graceful degradation',
      'Network: retries with exponential backoff, timeouts, idempotency',
    ],
    example: 'Redis cache fails: Fail-open strategy - requests go to DB. DB handles load temporarily. Alert ops team. Auto-recovery when Redis back up.',
  },
]

export const commonPatterns: CommonPattern[] = [
  {
    id: 'caching-layer',
    name: 'Caching Layer',
    description: 'Add an in-memory cache between application and database to reduce latency and database load.',
    useCases: [
      'Read-heavy workloads (>10:1 read to write)',
      'Frequently accessed data (hot spots)',
      'Expensive queries or computations',
      'Session data and user preferences',
    ],
    keyComponents: [
      'Cache store (Redis, Memcached)',
      'Cache-aside pattern (check cache, if miss, query DB, populate cache)',
      'TTL for automatic expiration',
      'Cache invalidation strategy (write-through, write-behind, invalidate-on-write)',
    ],
    tradeoffs: {
      pros: [
        'Dramatically reduces latency (ms vs seconds)',
        'Reduces database load',
        'Handles traffic spikes',
        'Cost-effective for read-heavy workloads',
      ],
      cons: [
        'Cache invalidation complexity',
        'Potential for stale data',
        'Additional infrastructure to manage',
        'Memory costs for large datasets',
      ],
    },
  },
  {
    id: 'load-balancing',
    name: 'Load Balancing',
    description: 'Distribute incoming traffic across multiple servers to improve reliability and throughput.',
    useCases: [
      'High traffic applications',
      'Horizontal scaling of stateless services',
      'Zero-downtime deployments',
      'Geographic distribution',
    ],
    keyComponents: [
      'Load balancer (nginx, HAProxy, AWS ALB)',
      'Health checks to detect failed servers',
      'Distribution algorithm (round-robin, least connections, IP hash)',
      'SSL termination at load balancer',
    ],
    tradeoffs: {
      pros: [
        'Improved availability (no single point of failure)',
        'Easy horizontal scaling',
        'Can handle server maintenance without downtime',
        'Enables blue-green deployments',
      ],
      cons: [
        'Additional network hop (slight latency)',
        'Load balancer itself can be bottleneck',
        'Session affinity complexity for stateful apps',
        'Configuration complexity',
      ],
    },
  },
  {
    id: 'database-sharding',
    name: 'Database Sharding',
    description: 'Partition data across multiple database instances to scale beyond single-machine limits.',
    useCases: [
      'Data too large for single machine',
      'Write throughput exceeds single DB capacity',
      'Geographic data locality requirements',
      'Isolation between tenants in multi-tenant systems',
    ],
    keyComponents: [
      'Shard key selection (user_id, geographic region, etc.)',
      'Consistent hashing for even distribution',
      'Routing layer to direct queries to correct shard',
      'Cross-shard query handling',
    ],
    tradeoffs: {
      pros: [
        'Near-linear scaling of storage and throughput',
        'Can handle massive datasets',
        'Fault isolation (one shard failure doesn\'t affect others)',
        'Geographic co-location possible',
      ],
      cons: [
        'Significant complexity increase',
        'Cross-shard queries are expensive',
        'Rebalancing shards is difficult',
        'Joins across shards nearly impossible',
      ],
    },
  },
  {
    id: 'message-queue',
    name: 'Message Queue / Event Streaming',
    description: 'Decouple producers and consumers with async message passing for reliability and scale.',
    useCases: [
      'Async processing (email, notifications)',
      'Handling traffic spikes (buffer requests)',
      'Microservice communication',
      'Event sourcing and audit logs',
    ],
    keyComponents: [
      'Message broker (Kafka, RabbitMQ, SQS)',
      'Producers (publish events)',
      'Consumers (process events)',
      'Dead letter queue for failed messages',
    ],
    tradeoffs: {
      pros: [
        'Decouples services (independent scaling)',
        'Handles spikes (queue absorbs burst)',
        'Reliability (messages persist until processed)',
        'Enables event-driven architecture',
      ],
      cons: [
        'Added latency (async vs sync)',
        'Message ordering complexity',
        'Debugging distributed flows is harder',
        'Additional infrastructure',
      ],
    },
  },
  {
    id: 'cdn',
    name: 'Content Delivery Network (CDN)',
    description: 'Cache static content at edge locations worldwide for low-latency delivery.',
    useCases: [
      'Static assets (images, CSS, JS)',
      'Video streaming',
      'Global user base needing low latency',
      'Reducing origin server load',
    ],
    keyComponents: [
      'CDN provider (CloudFront, Cloudflare, Akamai)',
      'Edge locations (PoPs)',
      'Cache headers (max-age, cache-control)',
      'Cache invalidation API',
    ],
    tradeoffs: {
      pros: [
        'Dramatic latency reduction for global users',
        'Reduces origin server load',
        'DDoS protection',
        'Handles traffic spikes at edge',
      ],
      cons: [
        'Cache invalidation delay',
        'Cost for high bandwidth usage',
        'Not suitable for highly dynamic content',
        'Debugging cache behavior can be tricky',
      ],
    },
  },
  {
    id: 'rate-limiting',
    name: 'Rate Limiting',
    description: 'Control the rate of requests to protect services from abuse and ensure fair usage.',
    useCases: [
      'API protection from abuse',
      'Fair resource allocation across users',
      'Preventing cascade failures',
      'Cost control for pay-per-use services',
    ],
    keyComponents: [
      'Rate limiter (token bucket, sliding window)',
      'Distributed counter (Redis)',
      'Rate limit headers (X-RateLimit-Remaining)',
      'Retry-After header for 429 responses',
    ],
    tradeoffs: {
      pros: [
        'Protects against abuse and DDoS',
        'Ensures fair resource allocation',
        'Prevents cascade failures',
        'Cost control',
      ],
      cons: [
        'May block legitimate traffic during spikes',
        'Configuration complexity (right limits)',
        'Distributed rate limiting is complex',
        'User experience impact when rate limited',
      ],
    },
  },
]

export const backOfEnvelopeCalculations: BackOfEnvelopeCalculation[] = [
  {
    id: 'storage-estimation',
    name: 'Storage Estimation',
    description: 'Calculate how much storage your system needs.',
    formula: 'Total Storage = (bytes per record) × (number of records)',
    example: {
      scenario: 'URL Shortener with 1 billion URLs',
      calculation: '~500 bytes/row (short code 8B + long URL 100B + metadata 400B) × 1B rows = 500GB',
      result: '500GB fits on a single modern SSD. Sharding not required for storage alone.',
    },
  },
  {
    id: 'qps-calculation',
    name: 'QPS (Queries Per Second)',
    description: 'Calculate the expected query load on your system.',
    formula: 'QPS = (daily requests) ÷ 86,400 seconds (or ÷ 100K for estimation)',
    example: {
      scenario: 'URL Shortener with 100M DAU, 10 clicks per user per day',
      calculation: '100M × 10 = 1B requests/day. 1B ÷ 100K = 10,000 QPS average. Peak = 3-5x = 30-50K QPS.',
      result: '10K QPS average, 50K QPS peak. Need caching (Redis handles 100K+ QPS) and multiple app servers.',
    },
  },
  {
    id: 'bandwidth-estimation',
    name: 'Bandwidth Estimation',
    description: 'Calculate network bandwidth requirements.',
    formula: 'Bandwidth = QPS × (request size + response size)',
    example: {
      scenario: 'URL Shortener redirect',
      calculation: '10K QPS × (500B request + 500B response) = 10K × 1KB = 10MB/s = 80Mbps',
      result: '80Mbps is modest. A single 1Gbps connection handles this easily.',
    },
  },
  {
    id: 'cache-size',
    name: 'Cache Size Estimation',
    description: 'Calculate how much cache memory you need.',
    formula: 'Cache Size = (items to cache) × (size per item). Use 80/20 rule: 20% of items serve 80% of traffic.',
    example: {
      scenario: 'Cache top 20% of 1B URLs',
      calculation: '1B × 20% = 200M URLs. 200M × 500 bytes = 100GB cache.',
      result: '100GB Redis cluster (or multiple nodes). Consider only caching top 1% (10GB) for cost savings.',
    },
  },
  {
    id: 'unique-ids',
    name: 'Unique ID Space',
    description: 'Calculate if your ID scheme has enough capacity.',
    formula: 'Combinations = (character set size) ^ (length). Base62 = 62 chars (a-z, A-Z, 0-9).',
    example: {
      scenario: '7-character short URLs using Base62',
      calculation: '62^7 = 3.5 trillion combinations. At 100K URLs/day = 36.5M URLs/year.',
      result: '3.5T ÷ 36.5M = ~100,000 years of capacity. 7 characters is more than sufficient.',
    },
  },
  {
    id: 'server-capacity',
    name: 'Server Capacity',
    description: 'Estimate number of servers needed.',
    formula: 'Servers = Peak QPS ÷ QPS per server. Typical web server: 1K-10K QPS depending on workload.',
    example: {
      scenario: '50K peak QPS, assuming 5K QPS per server',
      calculation: '50K ÷ 5K = 10 servers minimum. Add 50% for redundancy = 15 servers.',
      result: '15 application servers behind load balancer. Auto-scale based on actual load.',
    },
  },
]

// Key numbers to memorize for interviews
export const keyNumbers = {
  time: {
    secondsPerDay: 86_400,
    secondsPerYear: 31_536_000,
    approximateSecondsPerDay: 100_000, // easier for calculations
    approximateSecondsPerYear: 30_000_000,
  },
  storage: {
    KB: 1_000,
    MB: 1_000_000,
    GB: 1_000_000_000,
    TB: 1_000_000_000_000,
    // Common sizes
    tweetSize: 280, // bytes (characters)
    shortUrlSize: 500, // bytes (with metadata)
    imageSize: 300_000, // 300KB average
    videoMinuteSize: 50_000_000, // 50MB per minute (HD)
  },
  throughput: {
    singleMysqlQps: 10_000, // reads
    singleRedisQps: 100_000,
    singleKafkaQps: 1_000_000,
    networkBandwidth1Gbps: 125_000_000, // bytes/sec
  },
  latency: {
    memoryAccess: 0.0001, // 100ns in ms
    ssdAccess: 0.1, // ms
    hddAccess: 10, // ms
    networkSameDatacenter: 0.5, // ms
    networkCrossRegion: 50, // ms
    redisGet: 1, // ms
    mysqlSimpleQuery: 5, // ms
  },
}

// Study plan phases
export const studyPlan = {
  phase1: {
    name: 'Foundation (Week 1-2)',
    focus: 'Core concepts and patterns',
    activities: [
      'Learn all topics in "Networking & Infrastructure" and "Distributed Systems Fundamentals"',
      'Complete all flashcards in "Core Concepts" and "Networking" decks',
      'Pass quizzes with 80%+ score',
      'Memorize key numbers for back-of-envelope calculations',
    ],
  },
  phase2: {
    name: 'Problem Practice (Week 3-4)',
    focus: 'Solve classic problems',
    activities: [
      'Work through beginner problems: URL Shortener, Rate Limiter',
      'Progress to intermediate: Dropbox, WhatsApp',
      'Tackle advanced: Twitter, Uber, YouTube',
      'Time yourself: 45 minutes per problem',
      'Practice explaining out loud (rubber duck debugging)',
    ],
  },
  phase3: {
    name: 'Deep Dives (Week 5-6)',
    focus: 'Master specific areas',
    activities: [
      'Deep dive into databases: SQL vs NoSQL, sharding, replication',
      'Master caching: strategies, invalidation, Redis internals',
      'Study message queues: Kafka architecture, exactly-once delivery',
      'Learn about consistency: CAP theorem, eventual consistency patterns',
    ],
  },
  phase4: {
    name: 'Mock Interviews (Week 7-8)',
    focus: 'Interview simulation',
    activities: [
      'Practice with friends or mock interview services',
      'Record yourself and review',
      'Focus on communication: explaining trade-offs, asking clarifying questions',
      'Practice the 45-minute time constraint',
      'Get feedback and iterate',
    ],
  },
}
