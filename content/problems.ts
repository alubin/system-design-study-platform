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
  // CLASSIC SYSTEM DESIGN CASE STUDIES
  {
    id: 'url-shortener',
    title: 'Design a URL Shortener (TinyURL)',
    category: 'system-design',
    difficulty: 'intermediate',
    estimatedTime: 45,
    description: `Design a URL shortening service like TinyURL or bit.ly. Users can submit long URLs and receive short URLs that redirect to the original. The system should handle billions of URLs and high read traffic.`,
    functionalRequirements: [
      'Given a long URL, generate a unique short URL',
      'When users access the short URL, redirect to the original long URL',
      'Users can optionally specify a custom short URL',
      'URLs should expire after a configurable time (optional)',
      'Analytics: track click counts, geographic distribution, referrers',
      'Rate limiting to prevent abuse',
    ],
    nonFunctionalRequirements: [
      'High availability: 99.9% uptime',
      'Low latency: redirects < 100ms',
      'Scale: 100 million URLs created per month',
      'Read-heavy: 100:1 read to write ratio',
      'URLs should be as short as possible',
      'Short URLs should be unpredictable (not sequential)',
    ],
    constraints: [
      'Storage for billions of URL mappings',
      'Short URL length limits (6-8 characters)',
      'Handle 10,000 redirects per second',
      'Prevent short URL collisions',
    ],
    hints: [
      {
        title: 'Short URL Generation',
        content: 'Base62 encoding (a-z, A-Z, 0-9) gives 62^7 = 3.5 trillion combinations for 7 characters. Options: hash the URL and take first N chars, auto-increment ID + base62, or random generation with collision check.',
      },
      {
        title: 'Database Choice',
        content: 'Read-heavy workload suggests: NoSQL (DynamoDB, Cassandra) for scale, or SQL with caching (Redis). Key-value storage: short_url → long_url. Index on short_url for fast lookups.',
      },
      {
        title: 'Caching',
        content: 'Cache popular URLs in Redis. 80/20 rule: 20% of URLs get 80% of traffic. Cache-aside pattern. High cache hit ratio reduces database load dramatically.',
      },
      {
        title: 'Avoiding Collisions',
        content: 'If using hashing: check database for collision before inserting. If using auto-increment: counter service (single source of truth) or pre-generate ID ranges per server.',
      },
    ],
    sampleSolution: {
      overview: 'Distributed system with load balancer, application servers, NoSQL database for URL storage, Redis cache for popular URLs, and separate counter service for ID generation.',
      components: [
        {
          name: 'Load Balancer',
          description: 'Distributes traffic across application servers.',
          technology: 'nginx or AWS ALB',
        },
        {
          name: 'Application Servers',
          description: 'Handle URL creation and redirects. Stateless for horizontal scaling.',
          technology: 'Node.js or Go service',
        },
        {
          name: 'URL Database',
          description: 'Stores short_url → long_url mappings.',
          technology: 'Cassandra or DynamoDB (key-value, scales horizontally)',
        },
        {
          name: 'Cache Layer',
          description: 'Caches frequently accessed URLs.',
          technology: 'Redis with TTL',
        },
        {
          name: 'ID Generator',
          description: 'Generates unique IDs for short URLs.',
          technology: 'Twitter Snowflake or counter service with Zookeeper',
        },
        {
          name: 'Analytics Service',
          description: 'Tracks clicks asynchronously.',
          technology: 'Kafka + ClickHouse or BigQuery',
        },
      ],
      dataFlow: [
        '1. User submits long URL to API',
        '2. Application server generates unique ID (from ID generator or hash)',
        '3. Convert ID to base62 string for short URL',
        '4. Store mapping in database: short_url → long_url',
        '5. Return short URL to user',
        '6. On redirect: check cache first, then database',
        '7. Return 301/302 redirect to original URL',
        '8. Log click to analytics service asynchronously',
      ],
      keyDecisions: [
        {
          decision: 'Base62 encoding for short URLs',
          rationale: '62 characters (a-z, A-Z, 0-9) allow more combinations in fewer characters. 7 chars = 3.5 trillion unique URLs.',
        },
        {
          decision: 'NoSQL database (Cassandra/DynamoDB)',
          rationale: 'Simple key-value access pattern. Horizontal scaling for billions of records. No complex queries needed.',
        },
        {
          decision: 'Distributed ID generation',
          rationale: 'Snowflake-style IDs: timestamp + machine ID + sequence. Unique without coordination. Sortable by time.',
        },
        {
          decision: '301 vs 302 redirects',
          rationale: '301 (permanent): browser caches, fewer server hits, lose analytics. 302 (temporary): always hits server, full analytics. Use 302 for analytics.',
        },
      ],
      scalingConsiderations: [
        'Partition database by first character(s) of short URL',
        'Cache 20% of URLs to handle 80% of traffic',
        'Use CDN for static landing pages',
        'Geographic distribution with regional databases',
        'Pre-generate short URLs in batches to reduce latency',
      ],
      alternativeApproaches: [
        'SQL database with read replicas: simpler for smaller scale',
        'Content-based hashing (MD5/SHA): deterministic but collision-prone',
        'Zookeeper for distributed counter: strong consistency but bottleneck',
      ],
    },
  },
  {
    id: 'twitter-design',
    title: 'Design Twitter',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a social media platform like Twitter where users can post short messages (tweets), follow other users, and view a timeline of tweets from people they follow. Handle high read/write volume and real-time updates.`,
    functionalRequirements: [
      'Users can post tweets (280 characters max)',
      'Users can follow/unfollow other users',
      'Users see home timeline: tweets from people they follow, sorted by time',
      'Users can view any user\'s profile and their tweets',
      'Search tweets by keyword or hashtag',
      'Like and retweet functionality',
      'Push notifications for mentions and interactions',
    ],
    nonFunctionalRequirements: [
      'Timeline generation < 200ms',
      '500 million daily active users',
      '500 million tweets per day',
      'Average user follows 200 people',
      'Celebrity users may have millions of followers',
      'Eventually consistent (seconds acceptable)',
      '99.99% availability',
    ],
    constraints: [
      'Fan-out problem: popular user tweets must reach millions quickly',
      'Storage for years of tweets',
      'Real-time search across all tweets',
      'Handle traffic spikes during major events',
    ],
    hints: [
      {
        title: 'Timeline Generation - Fan-out on Write',
        content: 'When user tweets, push to followers\' timelines (stored in Redis). Fast reads. Problem: celebrities with millions of followers cause write amplification.',
      },
      {
        title: 'Timeline Generation - Fan-out on Read',
        content: 'On read, fetch tweets from all followed users and merge. Slow for users following many people. Good for celebrities (no fan-out on write).',
      },
      {
        title: 'Hybrid Approach',
        content: 'Fan-out on write for regular users. Fan-out on read for celebrities (>10K followers). Merge both at read time. Best of both worlds.',
      },
      {
        title: 'Tweet Storage',
        content: 'Tweets are immutable - store in append-only log. Partition by user_id. Replicate for availability. Use object storage for media (images, videos).',
      },
    ],
    sampleSolution: {
      overview: 'Hybrid fan-out system with Redis for timelines, distributed database for tweets, search service for queries, and CDN for media.',
      components: [
        {
          name: 'Tweet Service',
          description: 'Handles tweet creation, storage, and retrieval.',
          technology: 'Microservice with sharded MySQL or Cassandra',
        },
        {
          name: 'Timeline Service',
          description: 'Generates and caches home timelines.',
          technology: 'Redis clusters storing timeline per user (list of tweet IDs)',
        },
        {
          name: 'Fan-out Service',
          description: 'Pushes tweets to follower timelines.',
          technology: 'Kafka consumers processing tweet events',
        },
        {
          name: 'User Graph Service',
          description: 'Stores follow relationships.',
          technology: 'Graph database (Neo4j) or adjacency list in Redis',
        },
        {
          name: 'Search Service',
          description: 'Full-text search on tweets.',
          technology: 'Elasticsearch cluster',
        },
        {
          name: 'Media Service',
          description: 'Stores images,videos, handles transcoding.',
          technology: 'S3 + CDN + transcoding pipeline',
        },
        {
          name: 'Notification Service',
          description: 'Push notifications for mentions, likes, retweets.',
          technology: 'Kafka + Firebase Cloud Messaging / APNs',
        },
      ],
      dataFlow: [
        '1. User posts tweet → Tweet Service stores in database',
        '2. Tweet event published to Kafka',
        '3. Fan-out Service consumes event, checks if user is celebrity',
        '4. For normal users: push tweet ID to all followers\' timelines in Redis',
        '5. For celebrities: skip fan-out (will be fetched on read)',
        '6. Search indexer adds tweet to Elasticsearch',
        '7. When user loads timeline: fetch from Redis + merge celebrity tweets',
        '8. Hydrate tweet IDs with full tweet data from cache/database',
      ],
      keyDecisions: [
        {
          decision: 'Hybrid fan-out (write for most, read for celebrities)',
          rationale: 'Pure fan-out on write doesn\'t scale for celebrities (millions of writes per tweet). Pure fan-out on read is slow for heavy users. Hybrid balances both.',
        },
        {
          decision: 'Redis for timeline storage',
          rationale: 'In-memory for fast reads. List data structure for ordered timelines. Capped lists (keep last 800 tweets) to limit memory.',
        },
        {
          decision: 'Kafka for event distribution',
          rationale: 'Decouples tweet creation from fan-out. Handles backpressure. Enables multiple consumers (fan-out, search, analytics).',
        },
        {
          decision: 'Separate search cluster',
          rationale: 'Real-time search requires specialized infrastructure. Elasticsearch handles full-text and hashtag queries efficiently.',
        },
      ],
      scalingConsiderations: [
        'Partition Redis timelines by user ID hash',
        'Shard tweet database by user_id (keeps user tweets together)',
        'Cache hot tweets (viral content)',
        'Edge caching for celebrity profiles',
        'Throttle fan-out during traffic spikes (eventual consistency)',
      ],
      alternativeApproaches: [
        'Pure fan-out on read: simpler but slower timelines',
        'Activity streams: store activities as events, compute timelines from events',
        'Social graph in RDBMS: simpler but harder to scale',
      ],
    },
  },
  {
    id: 'instagram-design',
    title: 'Design Instagram',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a photo-sharing social network like Instagram. Users can upload photos, follow others, view feeds, like and comment on posts, and search for users/hashtags. Handle billions of photos and high engagement.`,
    functionalRequirements: [
      'Upload photos with captions and filters',
      'Follow/unfollow users',
      'View home feed (photos from followed users)',
      'Like and comment on photos',
      'User profiles with photo grid',
      'Search users by username',
      'Search posts by hashtags',
      'Stories (ephemeral 24-hour content)',
      'Direct messaging between users',
    ],
    nonFunctionalRequirements: [
      '1 billion monthly active users',
      '100 million photos uploaded daily',
      'Read-heavy: 1000:1 read to write ratio',
      'Feed generation < 500ms',
      'Photo upload < 5 seconds',
      'Global availability with low latency',
      '99.9% availability',
    ],
    constraints: [
      'Petabytes of photo storage',
      'Photo processing (resize, filters) at scale',
      'Feed generation for users following thousands',
      'Real-time notifications for likes/comments',
    ],
    hints: [
      {
        title: 'Photo Storage',
        content: 'Store original photo and generate multiple sizes (thumbnail, small, medium, large). Use object storage (S3). CDN for delivery. Separate metadata (likes, comments) from binary data.',
      },
      {
        title: 'Feed Generation',
        content: 'Similar to Twitter: hybrid fan-out. Pre-compute feeds for active users. Lazy compute for inactive users. Store post IDs in Redis.',
      },
      {
        title: 'Upload Pipeline',
        content: 'Async processing: accept upload, queue for processing (resize, filter, face detection), notify user when ready. Use message queue for reliability.',
      },
      {
        title: 'Stories',
        content: 'Ephemeral content with 24-hour TTL. Store in Redis with automatic expiry. Aggregate stories from followed users on read.',
      },
    ],
    sampleSolution: {
      overview: 'Media-focused architecture with S3 for photos, CDN for delivery, distributed database for metadata, Redis for feeds, and async processing pipeline for uploads.',
      components: [
        {
          name: 'Upload Service',
          description: 'Handles photo uploads, validates, queues for processing.',
          technology: 'API gateway with pre-signed S3 URLs for direct upload',
        },
        {
          name: 'Media Processing Pipeline',
          description: 'Resizes, applies filters, generates thumbnails.',
          technology: 'Lambda/Kubernetes jobs triggered by S3 events',
        },
        {
          name: 'Photo Storage',
          description: 'Stores original and processed photos.',
          technology: 'S3 with multiple size variants',
        },
        {
          name: 'CDN',
          description: 'Delivers photos globally with low latency.',
          technology: 'CloudFront or Cloudflare',
        },
        {
          name: 'Post Database',
          description: 'Stores post metadata: captions, timestamps, user references.',
          technology: 'Cassandra (wide-column for time-series posts)',
        },
        {
          name: 'Feed Service',
          description: 'Generates and serves user feeds.',
          technology: 'Redis for cached feeds + Cassandra for persistence',
        },
        {
          name: 'Social Graph',
          description: 'Manages follow relationships.',
          technology: 'Redis or graph database',
        },
        {
          name: 'Engagement Service',
          description: 'Handles likes, comments, counters.',
          technology: 'Cassandra with counter columns + Redis for hot data',
        },
        {
          name: 'Search Service',
          description: 'User and hashtag search.',
          technology: 'Elasticsearch',
        },
        {
          name: 'Stories Service',
          description: 'Manages ephemeral content.',
          technology: 'Redis with TTL for automatic expiry',
        },
      ],
      dataFlow: [
        '1. User uploads photo → Upload Service validates and stores original in S3',
        '2. S3 event triggers Media Processing Pipeline',
        '3. Pipeline creates thumbnails, applies filters, stores variants in S3',
        '4. Post metadata stored in Cassandra',
        '5. Fan-out service pushes post ID to followers\' feeds in Redis',
        '6. User opens app → Feed Service fetches from Redis, hydrates with post data',
        '7. Photos served from CDN (edge cached)',
        '8. Likes/comments update Engagement Service counters',
      ],
      keyDecisions: [
        {
          decision: 'Direct upload to S3 with pre-signed URLs',
          rationale: 'Bypasses application servers for large files. Reduces server load. S3 handles durability and scaling.',
        },
        {
          decision: 'Async media processing',
          rationale: 'Decouples upload from processing. User gets immediate confirmation. Processing can be retried on failure.',
        },
        {
          decision: 'CDN for all photos',
          rationale: 'Global users require low-latency access. CDN caches at edge. Origin (S3) protected from traffic spikes.',
        },
        {
          decision: 'Cassandra for posts and engagement',
          rationale: 'High write throughput for likes/comments. Time-series queries for feeds. Horizontal scaling for petabyte storage.',
        },
      ],
      scalingConsiderations: [
        'Partition posts by user_id (user\'s posts together)',
        'Separate storage for hot (recent) vs cold (archive) photos',
        'Rate limit uploads per user',
        'Lazy load comments (paginate)',
        'Edge compute for image optimization',
      ],
      alternativeApproaches: [
        'Blob storage other than S3: Azure Blob, GCS',
        'Pull-based feeds: compute on read, simpler but slower',
        'Microservices vs modular monolith for smaller scale',
      ],
    },
  },
  {
    id: 'uber-design',
    title: 'Design Uber (Ride Sharing)',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a ride-sharing service like Uber or Lyft. Riders request rides, nearby drivers are matched, real-time tracking during rides, and payments processed after completion. Handle millions of concurrent rides globally.`,
    functionalRequirements: [
      'Riders request rides with pickup and dropoff locations',
      'System matches riders with nearby available drivers',
      'Drivers accept/reject ride requests',
      'Real-time location tracking for riders and drivers',
      'ETA calculation for pickup and arrival',
      'Fare estimation before ride, final fare after',
      'Payment processing',
      'Rating system for riders and drivers',
      'Ride history for both parties',
    ],
    nonFunctionalRequirements: [
      '10 million daily rides',
      '1 million concurrent active drivers',
      'Match rider to driver in < 30 seconds',
      'Location updates every 4 seconds',
      'Real-time tracking with < 2 second lag',
      'High availability: 99.99%',
      'Accurate ETA within 2 minutes',
    ],
    constraints: [
      'Geospatial queries at scale (find nearby drivers)',
      'High-frequency location updates (millions/minute)',
      'Surge pricing during high demand',
      'Global operation across cities',
    ],
    hints: [
      {
        title: 'Location Indexing',
        content: 'Use geohashing or quadtrees to index driver locations. Geohash divides world into grid cells with string prefixes. Nearby locations share prefix. Query by geohash prefix for fast lookups.',
      },
      {
        title: 'Matching Algorithm',
        content: 'Find available drivers within radius of pickup location. Rank by: distance, rating, acceptance rate, ETA. Send request to best match first, timeout and try next.',
      },
      {
        title: 'Location Updates',
        content: 'Drivers send location every 4 seconds. Use WebSocket for real-time communication. Store in Redis with geospatial index (GEOADD/GEORADIUS). Update rider app via WebSocket.',
      },
      {
        title: 'ETA Calculation',
        content: 'Use routing service (Google Maps, OSRM) with traffic data. Cache common routes. Precompute ETAs for grid cells during low traffic.',
      },
    ],
    sampleSolution: {
      overview: 'Event-driven architecture with real-time location service, matching engine, ride management, and payment processing. WebSockets for live updates.',
      components: [
        {
          name: 'Location Service',
          description: 'Ingests and stores driver locations. Handles geospatial queries.',
          technology: 'Redis with GEOADD/GEORADIUS or custom quadtree',
        },
        {
          name: 'Matching Service',
          description: 'Finds optimal driver for rider request.',
          technology: 'Service querying Location Service, ranking algorithm',
        },
        {
          name: 'Ride Service',
          description: 'Manages ride lifecycle: request, accept, pickup, dropoff.',
          technology: 'State machine with event sourcing',
        },
        {
          name: 'Driver App Gateway',
          description: 'WebSocket connection for real-time updates to drivers.',
          technology: 'Socket.io or native WebSocket with Redis pub/sub',
        },
        {
          name: 'Rider App Gateway',
          description: 'WebSocket connection for real-time updates to riders.',
          technology: 'Socket.io or native WebSocket',
        },
        {
          name: 'ETA Service',
          description: 'Calculates estimated time of arrival.',
          technology: 'Google Maps API with caching layer',
        },
        {
          name: 'Pricing Service',
          description: 'Estimates and calculates fares, handles surge pricing.',
          technology: 'Microservice with ML models for demand prediction',
        },
        {
          name: 'Payment Service',
          description: 'Processes payments after ride completion.',
          technology: 'Stripe/Braintree integration with retry logic',
        },
        {
          name: 'Notification Service',
          description: 'Push notifications for ride status.',
          technology: 'Firebase Cloud Messaging / APNs',
        },
      ],
      dataFlow: [
        '1. Rider requests ride with pickup/dropoff locations',
        '2. Matching Service queries Location Service for nearby drivers (geohash query)',
        '3. ETA Service calculates pickup time for each candidate driver',
        '4. Pricing Service estimates fare (including surge if applicable)',
        '5. Best driver selected and receives request via WebSocket',
        '6. Driver accepts → Ride Service creates ride record, notifies rider',
        '7. During ride: driver app sends location every 4 sec → Location Service → Rider app via WebSocket',
        '8. On dropoff: final fare calculated, payment processed',
        '9. Both parties prompted to rate each other',
      ],
      keyDecisions: [
        {
          decision: 'Geohashing for location indexing',
          rationale: 'String-based indexing enables efficient range queries. Prefix matching finds nearby cells. Simpler than geographic databases.',
        },
        {
          decision: 'WebSocket for real-time updates',
          rationale: 'Bidirectional communication. Low latency for location updates. Efficient for high-frequency updates vs polling.',
        },
        {
          decision: 'Redis for driver locations',
          rationale: 'In-memory for fast geospatial queries. Built-in geospatial commands. High write throughput for location updates.',
        },
        {
          decision: 'Event sourcing for ride state',
          rationale: 'Complete audit trail of ride events. Easy to debug disputes. Can rebuild state from events.',
        },
      ],
      scalingConsiderations: [
        'Partition Location Service by city/region',
        'Separate read/write paths for location (write-heavy)',
        'Cache ETA calculations for popular routes',
        'Rate limit location updates (no faster than 4 sec)',
        'Queue ride requests during surge (prevent overload)',
      ],
      alternativeApproaches: [
        'PostGIS for geospatial: SQL-based, richer queries but slower',
        'Kafka for location stream: better for analytics but adds latency',
        'Peer-to-peer matching: drivers bid on rides (auction model)',
      ],
    },
  },
  {
    id: 'youtube-design',
    title: 'Design YouTube (Video Streaming)',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a video streaming platform like YouTube. Users can upload videos, watch videos with adaptive streaming, search for content, subscribe to channels, and interact through likes/comments. Handle billions of video views per day.`,
    functionalRequirements: [
      'Upload videos of various formats and durations',
      'Transcode videos to multiple resolutions and formats',
      'Adaptive bitrate streaming based on user bandwidth',
      'Video search by title, description, tags',
      'Subscribe to channels',
      'Like, comment, and share videos',
      'View counts and analytics for creators',
      'Personalized video recommendations',
      'Live streaming support',
    ],
    nonFunctionalRequirements: [
      '2 billion monthly active users',
      '500 hours of video uploaded per minute',
      '1 billion hours watched per day',
      'Video playback start < 200ms',
      'Buffer-free streaming at adaptive quality',
      'Global availability with low latency',
      '99.99% availability',
    ],
    constraints: [
      'Exabytes of video storage',
      'Massive bandwidth costs',
      'Transcoding at scale (CPU intensive)',
      'Real-time recommendations',
    ],
    hints: [
      {
        title: 'Video Transcoding',
        content: 'Convert uploaded videos to multiple formats (360p, 720p, 1080p, 4K) and codecs (H.264, VP9). Use distributed workers. Pre-generate popular resolutions, transcode rare ones on-demand.',
      },
      {
        title: 'Adaptive Streaming',
        content: 'Use HLS or DASH protocols. Video split into segments (2-10 seconds). Client downloads manifest listing available quality levels. Client switches quality based on bandwidth.',
      },
      {
        title: 'CDN Strategy',
        content: 'Cache popular videos at edge. Preposition viral content. Use multiple CDN providers. Origin-to-edge tiering for less popular content.',
      },
      {
        title: 'Recommendations',
        content: 'Collaborative filtering: users who watched X also watched Y. Content-based: similar videos by topic/creator. Deep learning models for personalization. Pre-compute recommendations offline.',
      },
    ],
    sampleSolution: {
      overview: 'Media processing pipeline for upload and transcoding, distributed storage, global CDN for delivery, search and recommendation services, and engagement tracking.',
      components: [
        {
          name: 'Upload Service',
          description: 'Handles video upload, validates, stores original.',
          technology: 'Chunked upload to object storage, queue for processing',
        },
        {
          name: 'Transcoding Pipeline',
          description: 'Converts videos to multiple formats and resolutions.',
          technology: 'Kubernetes cluster with FFmpeg workers',
        },
        {
          name: 'Video Storage',
          description: 'Stores original and transcoded video files.',
          technology: 'S3 or Google Cloud Storage with lifecycle policies',
        },
        {
          name: 'CDN Network',
          description: 'Delivers video segments globally.',
          technology: 'Multi-CDN (Akamai, CloudFront, Fastly)',
        },
        {
          name: 'Metadata Database',
          description: 'Video info: title, description, owner, stats.',
          technology: 'MySQL sharded by video_id or Vitess',
        },
        {
          name: 'Search Service',
          description: 'Full-text search on video metadata.',
          technology: 'Elasticsearch cluster',
        },
        {
          name: 'Recommendation Engine',
          description: 'Personalized video suggestions.',
          technology: 'ML platform with offline training, real-time serving',
        },
        {
          name: 'View Counter',
          description: 'Tracks and aggregates video views.',
          technology: 'Kafka + Flink for real-time counts, batch reconciliation',
        },
        {
          name: 'Comment Service',
          description: 'Handles comments with threading.',
          technology: 'Cassandra for write-heavy comment storage',
        },
        {
          name: 'Live Streaming',
          description: 'Real-time video ingest and distribution.',
          technology: 'RTMP ingest, HLS output, Wowza or custom',
        },
      ],
      dataFlow: [
        '1. Creator uploads video via chunked upload to object storage',
        '2. Upload complete → job queued for transcoding',
        '3. Transcoding workers generate multiple resolutions, create HLS/DASH segments',
        '4. Segments stored in object storage, CDN cache populated for popular regions',
        '5. Metadata indexed in Elasticsearch',
        '6. User searches/browses → recommendations from ML engine',
        '7. User clicks video → player fetches manifest from CDN',
        '8. Player downloads segments adaptively based on bandwidth',
        '9. View event logged to Kafka → aggregated to view count',
      ],
      keyDecisions: [
        {
          decision: 'Chunked upload',
          rationale: 'Large files need resumable uploads. Chunk failures can be retried. Progress tracking for user.',
        },
        {
          decision: 'HLS/DASH for streaming',
          rationale: 'Industry standard adaptive bitrate protocols. Wide device support. CDN-friendly (static files).',
        },
        {
          decision: 'Multi-CDN strategy',
          rationale: 'Different CDNs perform better in different regions. Failover if one CDN has issues. Cost optimization.',
        },
        {
          decision: 'Eventual consistency for view counts',
          rationale: 'Perfect accuracy not required immediately. Batch reconciliation handles discrepancies. Reduces write contention.',
        },
      ],
      scalingConsiderations: [
        'Transcode popular videos first (prioritize by expected views)',
        'Tiered storage: hot (SSD), warm (HDD), cold (archive)',
        'Preposition trending content to more CDN PoPs',
        'Shard by video_id (distribute hot videos)',
        'Rate limit uploads per user',
      ],
      alternativeApproaches: [
        'P2P streaming: reduce bandwidth costs, complex',
        'Just-in-time transcoding: less storage, higher compute',
        'CMAF: unified format for HLS and DASH',
      ],
    },
  },
  {
    id: 'whatsapp-design',
    title: 'Design WhatsApp (Messaging System)',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a real-time messaging application like WhatsApp. Users can send 1-on-1 messages, create group chats, see online status and read receipts, and share media. Handle billions of messages per day with real-time delivery.`,
    functionalRequirements: [
      'Send and receive text messages in real-time',
      'Create group chats (up to 256 members)',
      'Online/offline status indicators',
      'Read receipts (message delivered, read)',
      'Share images, videos, documents',
      'Message history and search',
      'End-to-end encryption',
      'Push notifications for offline users',
    ],
    nonFunctionalRequirements: [
      '2 billion monthly active users',
      '100 billion messages per day',
      'Message delivery < 100ms (same region)',
      'Support offline messaging (deliver when user comes online)',
      '99.99% availability',
      'Messages must be reliably delivered (no loss)',
      'Strong consistency for message ordering within a chat',
    ],
    constraints: [
      'Users may be offline for extended periods',
      'Group messages must be delivered to all members',
      'End-to-end encryption complicates server-side processing',
      'High connection count (millions of persistent connections)',
    ],
    hints: [
      {
        title: 'Connection Management',
        content: 'Use WebSocket or MQTT for persistent connections. Each user maintains one connection to a gateway server. Gateway servers handle millions of connections each.',
      },
      {
        title: 'Message Routing',
        content: 'When User A sends to User B: A\'s gateway sends to routing service, which looks up B\'s gateway and forwards. If B offline, store in database and push notification.',
      },
      {
        title: 'Message Storage',
        content: 'Store messages in database partitioned by chat_id or user_id. Use Cassandra for high write throughput. Keep recent messages in cache for fast retrieval.',
      },
      {
        title: 'Group Messaging',
        content: 'Fan-out on send: when message sent to group, routing service sends to all members\' gateways in parallel. Store single copy of message, reference by all members.',
      },
      {
        title: 'Read Receipts',
        content: 'Separate "delivered" and "read" status. Delivered: gateway confirms receipt to sender. Read: client app sends read event when message viewed.',
      },
    ],
    sampleSolution: {
      overview: 'Real-time messaging architecture with WebSocket gateways, message routing service, Cassandra for storage, and push notification system for offline users.',
      components: [
        {
          name: 'WebSocket Gateway',
          description: 'Maintains persistent connections with clients. Routes messages to/from routing service.',
          technology: 'Node.js or Go servers with 100K+ connections each',
        },
        {
          name: 'Connection Registry',
          description: 'Tracks which gateway each user is connected to.',
          technology: 'Redis: user_id → gateway_server_id',
        },
        {
          name: 'Message Routing Service',
          description: 'Routes messages between users. Handles group fan-out.',
          technology: 'Stateless microservice querying connection registry',
        },
        {
          name: 'Message Store',
          description: 'Persists all messages with chat history.',
          technology: 'Cassandra partitioned by chat_id, sorted by timestamp',
        },
        {
          name: 'Media Service',
          description: 'Handles upload, processing, and delivery of media files.',
          technology: 'S3 for storage, CDN for delivery, thumbnails via Lambda',
        },
        {
          name: 'Push Notification Service',
          description: 'Sends push notifications to offline users.',
          technology: 'Firebase Cloud Messaging / APNs',
        },
        {
          name: 'Presence Service',
          description: 'Tracks online/offline status, last seen time.',
          technology: 'Redis with TTL for online status',
        },
        {
          name: 'Group Service',
          description: 'Manages group membership and metadata.',
          technology: 'PostgreSQL for group data',
        },
      ],
      dataFlow: [
        '1. User A opens app → establishes WebSocket to nearest gateway',
        '2. Gateway registers user → connection stored in Connection Registry',
        '3. User A sends message to User B → gateway forwards to Routing Service',
        '4. Routing Service stores message in Message Store',
        '5. Routing Service queries Connection Registry for B\'s gateway',
        '6. If B online: forward message to B\'s gateway → delivered to B',
        '7. If B offline: queue message, send push notification',
        '8. Gateway sends delivery receipt back to A',
        '9. When B opens message, read receipt sent to A',
        '10. For groups: Routing Service fans out to all members in parallel',
      ],
      keyDecisions: [
        {
          decision: 'WebSocket for real-time messaging',
          rationale: 'Bidirectional, low latency, efficient for high-frequency messaging. Better than polling or long-polling.',
        },
        {
          decision: 'Cassandra for message storage',
          rationale: 'High write throughput for billions of messages. Partitioned by chat enables fast history retrieval. Tunable consistency.',
        },
        {
          decision: 'Separate Connection Registry',
          rationale: 'Decouples user location from gateway servers. Enables horizontal scaling of gateways. Fast lookups in Redis.',
        },
        {
          decision: 'Store-and-forward for offline users',
          rationale: 'Messages never lost. User receives all messages when coming online. Push notification triggers app open.',
        },
      ],
      scalingConsiderations: [
        'Shard gateways by geographic region for lower latency',
        'Partition Cassandra by chat_id for distributed writes',
        'Cache recent messages in Redis for fast sync',
        'Rate limit message sends per user to prevent spam',
        'Use message queues (Kafka) between routing and storage for reliability',
      ],
      alternativeApproaches: [
        'MQTT protocol: lighter weight than WebSocket, common in IoT',
        'PostgreSQL with Citus: simpler but may struggle at extreme scale',
        'gRPC streams: alternative to WebSocket with typed contracts',
      ],
    },
  },
  {
    id: 'dropbox-design',
    title: 'Design Dropbox (File Storage & Sync)',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a cloud file storage and synchronization service like Dropbox or Google Drive. Users can upload files, sync across devices, share files/folders, and collaborate in real-time. Handle large files and bandwidth-efficient sync.`,
    functionalRequirements: [
      'Upload and download files of any size (up to 50GB)',
      'Sync files across multiple devices automatically',
      'Share files/folders with specific users or via link',
      'File versioning and revision history',
      'Real-time collaboration (multiple editors)',
      'Folder organization and search',
      'Offline access with sync when reconnected',
      'Conflict resolution when same file edited on multiple devices',
    ],
    nonFunctionalRequirements: [
      '500 million users',
      'Exabytes of data stored',
      'Efficient sync: only transfer changed parts of files',
      'Upload large files reliably (resumable)',
      '99.99% availability',
      'Strong consistency: all devices see same file state',
    ],
    constraints: [
      'Large files (videos, archives) are common',
      'Bandwidth is expensive - minimize data transfer',
      'Users may have slow/intermittent connections',
      'Conflicts happen when offline devices sync',
    ],
    hints: [
      {
        title: 'Chunking',
        content: 'Split files into fixed-size chunks (4MB). Hash each chunk. Only upload chunks that changed. Enables deduplication and resumable uploads.',
      },
      {
        title: 'Sync Protocol',
        content: 'Client maintains local file metadata (path, chunk hashes). On change: compute new chunks, compare with server, upload only new/changed chunks.',
      },
      {
        title: 'Deduplication',
        content: 'Store chunks by content hash. If chunk already exists (same hash), reference it. Saves storage when many users upload same file.',
      },
      {
        title: 'Conflict Resolution',
        content: 'Vector clocks or version numbers per file. On conflict: keep both versions with naming convention (file.txt, file (conflicted copy).txt).',
      },
      {
        title: 'Real-time Sync',
        content: 'Long-polling or WebSocket to notify clients of changes. Server pushes change notification, client pulls updated metadata.',
      },
    ],
    sampleSolution: {
      overview: 'Chunked storage architecture with content-addressable chunks, metadata service for file organization, sync protocol for efficient updates, and notification system for real-time sync.',
      components: [
        {
          name: 'Sync Client',
          description: 'Desktop/mobile app that monitors files, computes chunks, syncs with server.',
          technology: 'Native app with file system watcher',
        },
        {
          name: 'Block Server',
          description: 'Handles chunk upload/download. Stores chunks in blob storage.',
          technology: 'Go/Rust service with S3 backend',
        },
        {
          name: 'Chunk Storage',
          description: 'Content-addressable store for file chunks.',
          technology: 'S3 or custom blob storage, key = chunk hash',
        },
        {
          name: 'Metadata Service',
          description: 'Tracks file paths, versions, chunk lists per user.',
          technology: 'PostgreSQL: files (user_id, path, version, chunks_json)',
        },
        {
          name: 'Sync Service',
          description: 'Computes diff between client and server state, returns needed changes.',
          technology: 'Stateless service querying metadata',
        },
        {
          name: 'Notification Service',
          description: 'Notifies clients of changes in real-time.',
          technology: 'WebSocket server with pub/sub (Redis)',
        },
        {
          name: 'Sharing Service',
          description: 'Manages file/folder permissions and share links.',
          technology: 'PostgreSQL: shares (resource_id, user_id, permission)',
        },
        {
          name: 'Search Service',
          description: 'Full-text search on file names and contents.',
          technology: 'Elasticsearch',
        },
      ],
      dataFlow: [
        '1. User saves file → Sync Client detects change via file watcher',
        '2. Client chunks file (4MB blocks), computes hash per chunk',
        '3. Client sends metadata to Sync Service: path, chunk hashes',
        '4. Sync Service compares with stored metadata, identifies new/changed chunks',
        '5. Client uploads only new chunks to Block Server',
        '6. Block Server stores chunks in S3 (key = hash for deduplication)',
        '7. Sync Service updates metadata: new version, new chunk list',
        '8. Notification Service broadcasts change to user\'s other devices',
        '9. Other devices pull updated metadata, download missing chunks',
        '10. Other devices reconstruct file from chunks',
      ],
      keyDecisions: [
        {
          decision: 'Content-based chunking with hashing',
          rationale: 'Only upload changed parts. Deduplication saves storage. Resumable uploads (retry individual chunks).',
        },
        {
          decision: 'Content-addressable storage',
          rationale: 'Store chunk once regardless of how many files reference it. Hash ensures integrity.',
        },
        {
          decision: 'Separate metadata and block storage',
          rationale: 'Metadata is small, needs strong consistency (PostgreSQL). Blocks are large, need cheap storage (S3).',
        },
        {
          decision: 'Version-based conflict detection',
          rationale: 'Simple to implement. User decides how to resolve conflicts. Alternative: operational transform for real-time collab.',
        },
      ],
      scalingConsiderations: [
        'Shard metadata by user_id',
        'Use CDN for popular shared files',
        'Tier storage: hot (SSD) for recent, cold (S3 Glacier) for old versions',
        'Rate limit uploads per user to prevent abuse',
        'Compression before chunking for text files',
      ],
      alternativeApproaches: [
        'Rolling hash (Rabin fingerprint): variable-size chunks that detect insertions better',
        'Operational Transform/CRDT: real-time collaborative editing like Google Docs',
        'Delta sync: compute binary diff instead of chunks (more efficient but complex)',
      ],
    },
  },
  {
    id: 'ticketmaster-design',
    title: 'Design Ticketmaster (Event Ticketing)',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design an event ticketing system like Ticketmaster. Users can browse events, view seating charts, select seats, and purchase tickets. Handle flash crowd scenarios where millions of users try to buy tickets simultaneously for popular events.`,
    functionalRequirements: [
      'Browse and search events by location, date, category',
      'View venue seating chart with available seats',
      'Select specific seats or best available',
      'Hold seats temporarily during checkout (e.g., 10 minutes)',
      'Process payment and issue tickets',
      'Queue system for high-demand events',
      'Transfer or resell tickets',
      'Event creation and management for organizers',
    ],
    nonFunctionalRequirements: [
      '100 million users',
      'Handle 1 million concurrent users for popular event sale',
      'Seat hold: prevent double-booking',
      'Checkout within 10 minutes or release seats',
      'Payment processing: exactly-once',
      'Low latency seat availability checks',
      '99.99% availability during sales',
    ],
    constraints: [
      'Limited inventory (fixed number of seats)',
      'Flash crowd: traffic spikes 1000x during popular sales',
      'Double-booking is unacceptable',
      'Users expect real-time seat availability',
      'Bots try to scalp tickets',
    ],
    hints: [
      {
        title: 'Inventory Management',
        content: 'Each seat is a unique inventory item with status: available, held, sold. Use optimistic locking or Redis transactions to prevent double-booking.',
      },
      {
        title: 'Seat Hold',
        content: 'When user selects seats, set status=held with TTL (10 min). Background job releases expired holds. User must complete checkout before expiry.',
      },
      {
        title: 'Virtual Queue',
        content: 'For high-demand events: users enter virtual waiting room. System admits users at controlled rate based on capacity. Prevents thundering herd.',
      },
      {
        title: 'Flash Crowd Handling',
        content: 'Cache everything possible. Pre-compute seat availability. Use Redis for real-time inventory. Horizontal scale all services. Rate limit per user.',
      },
    ],
    sampleSolution: {
      overview: 'Event-driven architecture with virtual queue for demand management, Redis for real-time inventory, distributed locking for seat holds, and idempotent payment processing.',
      components: [
        {
          name: 'Event Catalog',
          description: 'Stores event metadata: name, venue, date, pricing tiers.',
          technology: 'PostgreSQL with read replicas, CDN for static content',
        },
        {
          name: 'Seat Inventory Service',
          description: 'Manages real-time seat availability and holds.',
          technology: 'Redis for hot inventory, PostgreSQL as source of truth',
        },
        {
          name: 'Virtual Queue',
          description: 'Manages waiting room for high-demand events.',
          technology: 'Redis sorted set: queue_position → user_id with timestamp',
        },
        {
          name: 'Checkout Service',
          description: 'Handles seat selection, hold, and payment flow.',
          technology: 'Stateless service with session storage in Redis',
        },
        {
          name: 'Payment Service',
          description: 'Processes payments with idempotency.',
          technology: 'Stripe/Braintree integration with idempotency keys',
        },
        {
          name: 'Ticket Service',
          description: 'Issues tickets after payment, generates QR codes.',
          technology: 'Serverless function, stores tickets in database',
        },
        {
          name: 'Hold Expiry Worker',
          description: 'Releases expired seat holds.',
          technology: 'Background job scanning for expired holds',
        },
        {
          name: 'Bot Protection',
          description: 'CAPTCHA, rate limiting, device fingerprinting.',
          technology: 'Cloudflare, custom rate limiter',
        },
      ],
      dataFlow: [
        '1. User browses event → Event Catalog serves from cache',
        '2. For high-demand events: user enters virtual queue',
        '3. Queue admits users at controlled rate (e.g., 1000/min)',
        '4. User views seating chart → Inventory Service returns available seats',
        '5. User selects seats → Inventory Service atomically holds seats (Redis MULTI)',
        '6. Seats marked held with TTL=10min, user proceeds to checkout',
        '7. User completes payment → Payment Service processes with idempotency key',
        '8. On success: seats marked sold, ticket generated',
        '9. On failure/timeout: Hold Expiry Worker releases seats',
        '10. If expired during checkout: user notified, must reselect seats',
      ],
      keyDecisions: [
        {
          decision: 'Virtual queue for demand management',
          rationale: 'Prevents thundering herd. Fair ordering (first-come-first-served). Controls downstream load.',
        },
        {
          decision: 'Redis for real-time inventory',
          rationale: 'In-memory for speed. Atomic operations (MULTI/EXEC) prevent double-booking. TTL for automatic hold expiry.',
        },
        {
          decision: 'Optimistic locking for seat selection',
          rationale: 'High concurrency: pessimistic locks would serialize all requests. Optimistic: retry on conflict.',
        },
        {
          decision: 'Idempotent payments',
          rationale: 'Network failures may cause retries. Idempotency key ensures payment processed exactly once.',
        },
      ],
      scalingConsiderations: [
        'Pre-warm caches before popular sales',
        'Horizontal scale all services before expected spike',
        'Shard inventory by event_id',
        'Use CDN for static assets and seating charts',
        'Rate limit per user IP and session',
        'Graceful degradation: show "limited availability" if system overloaded',
      ],
      alternativeApproaches: [
        'Lottery system: instead of queue, random selection among registrants',
        'Auction: highest bidder gets ticket (reduces bot incentive)',
        'Distributed lock (Redlock): alternative to Redis MULTI for seat holds',
      ],
    },
  },
  {
    id: 'rate-limiter-design',
    title: 'Design a Rate Limiter',
    category: 'system-design',
    difficulty: 'intermediate',
    estimatedTime: 45,
    description: `Design a rate limiting system that protects APIs from abuse. Support multiple algorithms (token bucket, sliding window), configurable limits per user/IP/API, distributed operation across multiple servers, and real-time monitoring.`,
    functionalRequirements: [
      'Limit requests per user, IP, or API key',
      'Configurable rate limits (e.g., 100 req/min, 1000 req/hour)',
      'Support multiple algorithms: token bucket, sliding window, fixed window',
      'Return appropriate headers (X-RateLimit-Remaining, Retry-After)',
      'Allow rate limit overrides for specific users (whitelist/premium)',
      'Real-time dashboard showing rate limit hits',
      'Configurable actions: reject, throttle, or queue',
    ],
    nonFunctionalRequirements: [
      'Low latency: < 1ms overhead per request',
      'High throughput: 1 million req/sec',
      'Distributed: work across multiple API servers',
      'Accurate: no significant over-limit or under-limit',
      'Fault tolerant: continue working if rate limiter down',
    ],
    constraints: [
      'Shared state across distributed servers',
      'Clock synchronization between servers',
      'Memory constraints for tracking per-user state',
    ],
    hints: [
      {
        title: 'Token Bucket Algorithm',
        content: 'Bucket holds tokens, refills at constant rate. Each request consumes token. If empty, reject. Allows bursts up to bucket size.',
      },
      {
        title: 'Sliding Window Counter',
        content: 'Track request count in current and previous window. Weighted sum: current_count + prev_count * overlap_percentage. Smoother than fixed window.',
      },
      {
        title: 'Fixed Window',
        content: 'Count requests per time window (e.g., per minute). Reset at window boundary. Simple but has boundary spike problem.',
      },
      {
        title: 'Distributed Rate Limiting',
        content: 'Central counter in Redis accessed by all servers. Atomic INCR operation. Or: local rate limiter + periodic sync (less accurate but faster).',
      },
    ],
    sampleSolution: {
      overview: 'Distributed rate limiter using Redis for shared state, supporting multiple algorithms, with configurable rules per endpoint/user and real-time monitoring.',
      components: [
        {
          name: 'Rate Limiter Library',
          description: 'In-process library called by API servers to check limits.',
          technology: 'Language-native library (Node.js, Go, Java)',
        },
        {
          name: 'Rule Store',
          description: 'Stores rate limit rules: endpoint, user tier, limits.',
          technology: 'PostgreSQL, cached in memory',
        },
        {
          name: 'Counter Store',
          description: 'Tracks request counts per key.',
          technology: 'Redis with atomic operations',
        },
        {
          name: 'Rate Limit Middleware',
          description: 'Intercepts requests, applies rate limiting logic.',
          technology: 'Express/Gin/Spring middleware',
        },
        {
          name: 'Monitoring Service',
          description: 'Aggregates rate limit events for dashboard.',
          technology: 'Prometheus metrics + Grafana',
        },
        {
          name: 'Config API',
          description: 'CRUD for rate limit rules.',
          technology: 'REST API',
        },
      ],
      dataFlow: [
        '1. Request arrives at API server',
        '2. Rate Limit Middleware extracts key (user_id, IP, API key)',
        '3. Fetch applicable rule from Rule Store (cached)',
        '4. Apply algorithm against Counter Store:',
        '   - Token Bucket: DECR tokens, check if >= 0',
        '   - Sliding Window: GET current + prev window counts, calculate weighted sum',
        '   - Fixed Window: INCR counter with TTL = window size',
        '5. If under limit: allow request, update headers',
        '6. If over limit: return 429 with Retry-After header',
        '7. Log event to Monitoring Service',
        '8. Request proceeds to API handler (if allowed)',
      ],
      keyDecisions: [
        {
          decision: 'Redis for distributed counters',
          rationale: 'Shared state across servers. Atomic operations (INCR, DECR). Fast in-memory performance. TTL for automatic cleanup.',
        },
        {
          decision: 'Token Bucket as default algorithm',
          rationale: 'Allows bursts (good UX). Simple to implement. Memory efficient (one counter per key).',
        },
        {
          decision: 'Rule caching in memory',
          rationale: 'Rules change infrequently. In-memory lookup is O(1). Refresh on config change.',
        },
        {
          decision: 'Fail-open on Redis failure',
          rationale: 'Availability over protection. If rate limiter down, allow requests rather than block all.',
        },
      ],
      scalingConsiderations: [
        'Shard Redis by key hash',
        'Local rate limiting for first line of defense (less accurate but faster)',
        'Batch counter updates: buffer locally, sync to Redis periodically',
        'Use Redis Lua scripts for complex algorithms (atomic operations)',
        'Expire old keys to limit memory usage',
      ],
      alternativeApproaches: [
        'Leaky Bucket: smooth output rate, queue excess requests',
        'Sliding Window Log: store timestamp of each request, most accurate but memory intensive',
        'Distributed consensus: use Raft for consistent counters (overkill for most cases)',
      ],
    },
  },
  {
    id: 'web-crawler-design',
    title: 'Design a Web Crawler',
    category: 'system-design',
    difficulty: 'advanced',
    estimatedTime: 60,
    description: `Design a web crawler that systematically browses the internet to index web pages for a search engine. Handle billions of pages, respect robots.txt, avoid duplicate content, and prioritize important pages.`,
    functionalRequirements: [
      'Crawl web pages starting from seed URLs',
      'Extract and follow links to discover new pages',
      'Respect robots.txt and crawl-delay directives',
      'Detect and avoid duplicate content',
      'Store page content and metadata for indexing',
      'Handle various content types (HTML, PDF, images)',
      'Re-crawl pages periodically to detect updates',
      'Prioritize crawling based on page importance',
    ],
    nonFunctionalRequirements: [
      'Crawl billions of pages',
      'Crawl rate: 1000+ pages/second',
      'Politeness: don\'t overload any single website',
      'Freshness: detect page updates within days',
      'Fault tolerant: handle network failures, timeouts',
      'Scalable: add capacity linearly',
    ],
    constraints: [
      'Internet is massive and constantly changing',
      'Many pages are duplicates or near-duplicates',
      'Websites have varying crawl policies',
      'Some sites try to trap crawlers (spider traps)',
    ],
    hints: [
      {
        title: 'URL Frontier',
        content: 'Queue of URLs to crawl. Priority queue based on page importance. Separate queues per domain to enforce politeness (crawl delay).',
      },
      {
        title: 'Duplicate Detection',
        content: 'Content hash (MD5/SHA) for exact duplicates. SimHash or MinHash for near-duplicates. URL normalization to canonicalize URLs.',
      },
      {
        title: 'Politeness',
        content: 'Fetch robots.txt first. Respect crawl-delay. One connection per domain at a time. Exponential backoff on errors.',
      },
      {
        title: 'Distributed Crawling',
        content: 'Partition URLs by domain hash. Each crawler owns specific domains. Coordinates via message queue.',
      },
    ],
    sampleSolution: {
      overview: 'Distributed crawler with URL frontier for scheduling, DNS resolver cache, content deduplication, and politeness enforcement per domain.',
      components: [
        {
          name: 'URL Frontier',
          description: 'Priority queue of URLs to crawl, partitioned by domain.',
          technology: 'Redis sorted sets per domain, or Kafka topics',
        },
        {
          name: 'Crawler Workers',
          description: 'Fetch pages, extract links, respect robots.txt.',
          technology: 'Go/Python workers with HTTP client',
        },
        {
          name: 'DNS Resolver Cache',
          description: 'Caches DNS lookups to reduce latency.',
          technology: 'Local DNS cache or dedicated DNS server',
        },
        {
          name: 'Robots.txt Cache',
          description: 'Caches robots.txt per domain.',
          technology: 'Redis with TTL (24 hours)',
        },
        {
          name: 'Content Store',
          description: 'Stores fetched page content.',
          technology: 'S3 or HDFS for raw HTML',
        },
        {
          name: 'URL Database',
          description: 'Tracks crawled URLs, timestamps, hashes.',
          technology: 'Cassandra or BigTable',
        },
        {
          name: 'Deduplication Service',
          description: 'Detects duplicate and near-duplicate content.',
          technology: 'Bloom filter for exact, SimHash for near-duplicates',
        },
        {
          name: 'Link Extractor',
          description: 'Parses HTML, extracts and normalizes links.',
          technology: 'HTML parser (BeautifulSoup, jsoup)',
        },
        {
          name: 'Scheduler',
          description: 'Decides which URLs to crawl next, re-crawl frequency.',
          technology: 'Scoring algorithm: PageRank, freshness, domain authority',
        },
      ],
      dataFlow: [
        '1. Seed URLs added to URL Frontier with high priority',
        '2. Scheduler assigns URLs to crawler workers (one domain per worker)',
        '3. Worker checks robots.txt cache, fetches if missing',
        '4. If allowed: fetch page with politeness delay',
        '5. Store raw content in Content Store',
        '6. Compute content hash, check Deduplication Service',
        '7. If duplicate: skip, update URL Database',
        '8. If new: extract links with Link Extractor',
        '9. Normalize extracted URLs, filter (same domain? visited?)',
        '10. Add new URLs to URL Frontier with priority',
        '11. Update URL Database with crawl timestamp',
        '12. Scheduler periodically adds URLs for re-crawling based on change frequency',
      ],
      keyDecisions: [
        {
          decision: 'Per-domain queues in frontier',
          rationale: 'Enables politeness (one request per domain at a time). Prevents any domain from monopolizing crawlers.',
        },
        {
          decision: 'Bloom filter for URL deduplication',
          rationale: 'Memory efficient. False positives OK (skip some URLs). No false negatives (never crawl duplicate).',
        },
        {
          decision: 'SimHash for near-duplicate detection',
          rationale: 'Catches pages with minor differences (ads, timestamps). Reduces index bloat.',
        },
        {
          decision: 'Priority scheduling',
          rationale: 'Crawl important pages first. PageRank-like scoring. Re-crawl frequently changing pages more often.',
        },
      ],
      scalingConsiderations: [
        'Partition URL frontier by domain hash',
        'Each crawler worker handles multiple domains (round-robin with delay)',
        'Batch writes to URL Database',
        'Compress stored content',
        'Use CDN for serving cached robots.txt',
      ],
      alternativeApproaches: [
        'Mercator architecture: classic distributed crawler design',
        'Focused crawling: only crawl pages matching specific topics',
        'Incremental crawling: only fetch changed portions of pages',
      ],
    },
  },
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
