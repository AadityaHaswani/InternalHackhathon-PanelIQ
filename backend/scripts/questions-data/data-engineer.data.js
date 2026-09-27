export const DATA_ENGINEER_QUESTIONS = [
  // ===================== JUNIOR QUESTIONS (1 to 10) =====================
  {
    id: 'de-j-intro-data-pipeline',
    role: 'data_engineer',
    level: 'junior',
    stage: 'icebreaker',
    topics: ['project_tradeoffs'],
    prompt: 'Describe a data pipeline or ETL job you built or maintained. Where did the source data originate, what transformations were applied, and how was it loaded for downstream consumers?',
    followUp: 'What was the most challenging data quality issue or schema discrepancy you uncovered in that pipeline?',
    concepts: [
      'ETL/ELT pipeline workflow (Extract, Transform, Load)',
      'Source systems (RDBMS, event streams, files) vs downstream analytics targets',
      'Data transformation logic and operational error handling'
    ],
    anchors: {
      0: 'Cannot describe any structured data pipeline or ETL workflow; relies on manual spreadsheet exports.',
      1: 'Describes a basic Python script without error handling, logging, or understanding of data delivery guarantees.',
      2: 'Explains an ETL pipeline with source and target databases, but lacks detail on intermediate transformations or validation checks.',
      3: 'Clearly details end-to-end pipeline stages: source ingestion, transformation logic, destination schema, and data validation steps.',
      4: 'Deep pipeline maturity: explains idempotent ingestion, dead-letter queues for unparseable records, execution latency, and automated alert monitoring.'
    },
    rubricNotes: 'Unscored icebreaker. Look for authentic pipeline ownership, data awareness, and clear technical communication.'
  },
  {
    id: 'de-j-sql-window-functions',
    role: 'data_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['databases'],
    prompt: 'Explain how SQL window functions like ROW_NUMBER(), RANK(), and DENSE_RANK() work with PARTITION BY and ORDER BY. In what scenario would you use a window function instead of a standard GROUP BY?',
    followUp: 'How would you use ROW_NUMBER() in a Common Table Expression (CTE) to deduplicate records based on the latest timestamp?',
    concepts: [
      'Window functions mechanics: computing across rows while retaining individual row identity (no row collapsing)',
      'Differences between ROW_NUMBER() (unique sequential integers), RANK() (gaps on ties), and DENSE_RANK() (no gaps)',
      'Deduplication patterns using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC) = 1'
    ],
    anchors: {
      0: 'Confuses window functions with aggregate GROUP BY; does not understand PARTITION BY.',
      1: 'Knows window functions exist but cannot explain the difference between RANK and DENSE_RANK or why rows are not collapsed.',
      2: 'Explains window functions and partitioning correctly, but struggles to write an accurate deduplication query using a CTE.',
      3: 'Clearly contrasts ROW_NUMBER, RANK, and DENSE_RANK; explains how PARTITION BY divides row sets; demonstrates CTE deduplication query.',
      4: 'Mastery of analytical SQL: discusses frame specifications (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), performance impact on sorting/spilling, and execution order.'
    },
    rubricNotes: 'Technical scoring guidance. Tests analytical SQL depth, ranking mechanics, and practical deduplication techniques.'
  },
  {
    id: 'de-j-star-vs-snowflake-schema',
    role: 'data_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['databases'],
    prompt: 'Compare a Star Schema and a Snowflake Schema in data warehouse dimensional modeling. What are the trade-offs between normalized dimension hierarchies and denormalized wide fact tables for analytical query performance?',
    followUp: 'Why do analytical columnar warehouses (like Snowflake or BigQuery) often perform better with denormalized star schemas despite redundant data storage?',
    concepts: [
      'Dimensional modeling: Fact tables (metrics, foreign keys) vs Dimension tables (descriptive attributes)',
      'Star Schema: denormalized dimensions with fewer joins, simpler queries, and faster analytical scanning',
      'Snowflake Schema: normalized dimensions saving storage space but increasing join complexity and query latency'
    ],
    anchors: {
      0: 'Cannot define fact tables or dimension tables; confuses OLTP relational normalization with analytical warehousing.',
      1: 'Defines star and snowflake schemas superficially by shape but cannot explain why normalization affects query performance.',
      2: 'Explains star vs snowflake schemas accurately, but struggles to evaluate when denormalization is preferred over storage savings.',
      3: 'Clearly evaluates both schemas: explains how Star reduces join overhead for OLAP, while Snowflake reduces data redundancy; explains trade-offs in query speed vs maintenance.',
      4: 'Architectural depth: discusses columnar compression efficiencies on repeated values, surrogate keys vs natural keys, and modern cloud storage economics favoring denormalization.'
    },
    rubricNotes: 'Technical scoring guidance. Tests dimensional modeling principles, warehouse design patterns, and join performance trade-offs.'
  },
  {
    id: 'de-j-batch-etl-idempotency',
    role: 'data_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['reliability'],
    prompt: 'How do you design a daily batch ETL pipeline to be idempotent? If a job fails halfway through or runs twice in the same day, how do you prevent duplicate data or inconsistent metrics?',
    followUp: 'How do atomic partition overwrites or UPSERT operations help achieve idempotency compared to naive append-only inserts?',
    concepts: [
      'Idempotency concept: running a pipeline multiple times produces the exact same end state without side effects or duplicates',
      'Strategies for idempotent ingestion: atomic partition overwrites (DELETE + INSERT or dynamic partition replacement), staging tables, and MERGE/UPSERT logic',
      'Handling partial pipeline failures and transactional commits in data warehouses'
    ],
    anchors: {
      0: 'Suggests append-only inserts with no deduplication, leading to duplicated data whenever a job is retried.',
      1: 'Suggests running TRUNCATE on the entire table before inserting, causing complete data loss or downtime during job execution.',
      2: 'Understands idempotency and suggests deleting old partition data before inserting, but does not address atomicity or concurrent readers.',
      3: 'Designs robust idempotent job using staging tables, atomic partition swapping, or MERGE statements keyed on business identifiers; guarantees retry safety.',
      4: 'Comprehensive reliability: discusses transactional staging mechanisms, write-audit-publish (WAP) patterns, and monitoring duplicate keys via automated assertions.'
    },
    rubricNotes: 'Technical scoring guidance. Evaluates understanding of idempotent data processing, pipeline retry safety, and data consistency.'
  },
  {
    id: 'de-j-file-formats-parquet-vs-csv',
    role: 'data_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['databases'],
    prompt: 'Why is columnar storage like Apache Parquet or ORC preferred over row-oriented formats like CSV or JSON for analytical data warehouses? How do column projection and dictionary encoding improve query efficiency?',
    followUp: 'What are the downsides of columnar formats when performing frequent single-row transactional inserts or updates?',
    concepts: [
      'Row-oriented storage (CSV, JSON, Avro) vs Columnar storage (Parquet, ORC)',
      'Column projection (reading only requested columns) and predicate pushdown (skipping row groups using min/max statistics)',
      'Compression techniques (run-length encoding, dictionary encoding) enabled by homogeneous data types per column'
    ],
    anchors: {
      0: 'Thinks CSV and Parquet are equivalent aside from Parquet being binary; cannot explain columnar layout.',
      1: 'States Parquet is faster and smaller, but cannot explain why columnar layout improves scan speed or compression.',
      2: 'Explains columnar storage and column projection, but cannot describe compression mechanisms or predicate pushdown statistics.',
      3: 'Clearly details advantages of Parquet: column projection reads fewer bytes, homogeneous columns compress efficiently, and row-group metadata allows predicate skipping.',
      4: 'Deep data engineering knowledge: explains file footer metadata, dictionary pages, Snappy/ZSTD compression trade-offs, and why row-oriented formats are better for OLTP streaming ingestion.'
    },
    rubricNotes: 'Technical scoring guidance. Tests storage layer understanding, analytical scan optimization, and file format trade-offs.'
  },
  {
    id: 'de-j-data-quality-validation',
    role: 'data_engineer',
    level: 'junior',
    stage: 'technical',
    topics: ['reliability'],
    prompt: 'How do you implement automated data quality validation in a pipeline before loading records into a reporting table? How do you handle schema mismatches, null values in primary keys, and outlier metric values?',
    followUp: 'What framework or approach (e.g. Great Expectations, dbt tests, custom SQL assertions) have you used to catch data quality regressions automatically?',
    concepts: [
      'Data quality dimensions: completeness, uniqueness, timeliness, validity, and accuracy',
      'Automated testing tools: dbt schema tests, Great Expectations, or custom SQL boundary assertions',
      'Quarantine and dead-letter handling: isolating invalid rows into error tables while allowing valid records to proceed'
    ],
    anchors: {
      0: 'Does not implement data validation; assumes source data is always clean and correct until downstream reports break.',
      1: 'Relies on manual ad-hoc SQL checks after loading directly into production tables, with no automated gate.',
      2: 'Writes basic NOT NULL or primary key constraints, but does not handle quarantine tables or outlier alerts.',
      3: 'Designs automated quality gates: schema enforcement, pre-load assertions (null checks, referential integrity, range bounds), and routes corrupt rows to quarantine.',
      4: 'Production data ops: integrates dbt tests / Great Expectations into CI/CD pipelines, publishes data quality SLAs, and configures automated Slack/PagerDuty alerts for metric anomalies.'
    },
    rubricNotes: 'Technical scoring guidance. Evaluates defensive data engineering, automated validation frameworks, and data hygiene.'
  },
  {
    id: 'de-j-project-schema-drift',
    role: 'data_engineer',
    level: 'junior',
    stage: 'techno_managerial',
    topics: ['reliability', 'project_tradeoffs'],
    prompt: 'Walk me through a situation where an upstream backend service changed its database schema or payload structure without warning, breaking your downstream analytical pipelines. How did you identify the issue and prevent future occurrences?',
    followUp: 'How do you establish schema contracts or communication channels between application engineering teams and data engineering?',
    concepts: [
      'Schema drift: handling unexpected columns, type changes, or dropped fields in source data',
      'Defensive ingestion: schema validation on ingest, flexible JSON variant storage, or schema registries',
      'Cross-team collaboration: defining data contracts and change notification protocols with backend teams'
    ],
    anchors: {
      0: 'Blames backend engineers and takes no technical steps to protect the pipeline against future schema modifications.',
      1: 'Fixed the broken query manually but left the pipeline vulnerable to the next unexpected schema modification.',
      2: 'Added schema error handling, but did not initiate cross-team alignment or preventive data governance.',
      3: 'Identified root cause using pipeline logs, recovered missing data, and implemented schema validation gates along with cross-team schema change notification procedures.',
      4: 'Organizational leadership: introduced formal Data Contracts or Avro/Protobuf schema registry with versioning, automated breaking-change CI checks, and clear SLAs between producers and consumers.'
    },
    rubricNotes: 'Techno-managerial scoring guidance. Evaluates resilience in handling external dependencies, stakeholder alignment, and data contracts.'
  },
  {
    id: 'de-j-project-pii-masking',
    role: 'data_engineer',
    level: 'junior',
    stage: 'techno_managerial',
    topics: ['reliability', 'project_tradeoffs'],
    prompt: 'Describe a project where you had to ingest, store, and process sensitive data (such as PII, credit card details, or HIPAA data). How did you enforce column-level encryption, tokenization, and access control across data analysts and data scientists?',
    followUp: 'How do dynamic data masking policies in cloud warehouses allow analysts to query aggregate trends without viewing raw identifiable values?',
    concepts: [
      'Data governance and compliance: GDPR, HIPAA, PCI-DSS compliance requirements',
      'Security techniques: SHA-256 hashing, tokenization, column-level encryption, and role-based access control (RBAC)',
      'Dynamic data masking: selectively obfuscating strings based on user role while preserving queryability'
    ],
    anchors: {
      0: 'Stores unencrypted PII in plain text with wide open warehouse read access; ignores security and compliance requirements.',
      1: 'Relies on basic database passwords, leaving raw customer email and phone numbers visible to all internal database users.',
      2: 'Applies static hashing to sensitive fields, but cannot explain access control models or how to manage encryption keys securely.',
      3: 'Implements robust PII security: hashes/tokens at ingestion layer, applies dynamic masking policies for non-privileged roles, and enforces strict RBAC.',
      4: 'Comprehensive security posture: explains key rotation using KMS, differential privacy for analytical queries, audit access logging, and GDPR right-to-be-forgotten deletion workflows.'
    },
    rubricNotes: 'Techno-managerial scoring guidance. Tests data security, compliance awareness, and privacy engineering practices.'
  },
  {
    id: 'de-j-project-late-arriving-data',
    role: 'data_engineer',
    level: 'junior',
    stage: 'techno_managerial',
    topics: ['databases', 'project_tradeoffs'],
    prompt: 'How did you handle late-arriving or out-of-order data events in a reporting pipeline? When business dashboards expect daily reconciled figures, what trade-offs did you make between reprocessing historical partitions and publishing revised metrics?',
    followUp: 'How do you communicate to executive business stakeholders that yesterday\'s final revenue numbers were updated due to late arriving transactions?',
    concepts: [
      'Late-arriving data: mobile app offline sync, delayed third-party partner deliveries, or network partition catch-up',
      'Processing strategies: sliding lookback windows, partition reprocessing, or restatement flags',
      'Stakeholder communication: explaining restatements, versioned snapshots, and data reconciliation windows'
    ],
    anchors: {
      0: 'Ignores late-arriving data completely, silently dropping records that arrive after midnight.',
      1: 'Reprocesses the entire 5-year data warehouse every night to catch late rows, causing runaway compute costs.',
      2: 'Reprocesses recent partitions (e.g. last 3 days) but does not have a clear strategy for stakeholder communication when historical figures change.',
      3: 'Implements configurable sliding lookback window (e.g. 7-day restatement window), tracks watermarks, and establishes clear stakeholder expectations for data finality.',
      4: 'Architectural sophistication: creates immutable snapshot tables alongside restated fact tables, provides clear audit logs, and designs automated reconciliation alerts.'
    },
    rubricNotes: 'Techno-managerial scoring guidance. Evaluates understanding of event time vs processing time, pipeline trade-offs, and stakeholder transparency.'
  },
  {
    id: 'de-j-reflect-query-optimization',
    role: 'data_engineer',
    level: 'junior',
    stage: 'reflection',
    topics: ['databases', 'project_tradeoffs'],
    prompt: 'Reflect on a slow-running SQL query or Spark transformation job that was consuming excessive cloud resources. What metrics or execution plan did you analyze to locate the bottleneck, and what did that experience teach you about query optimization?',
    followUp: 'How did that experience change how you write queries or structure warehouse tables from the beginning?',
    concepts: [
      'Execution plan analysis: EXPLAIN plans, full table scans, Cartesian cross joins, sort/spill to disk',
      'Optimization remedies: clustering keys, partition pruning, eliminating nested correlated subqueries, or filter pushdowns',
      'Self-reflection and continuous improvement in writing efficient, scalable SQL'
    ],
    anchors: {
      0: 'Cannot articulate what made the query slow; simply increased server RAM or cloud warehouse size to make it finish.',
      1: 'Describes a slow query but cannot explain how to read an EXPLAIN plan or what the underlying computational bottleneck was.',
      2: 'Fixed the query by adding an index or rewriting a join, but lacks deeper reflection on query execution mechanics or long-term design lessons.',
      3: 'Analyzed execution plan (e.g. heavy shuffle, full table scan, disk spilling), applied targeted fix (pruning, join order, clustering), and articulates clear engineering lessons.',
      4: 'Deep architectural reflection: explains query planner costing models, data distribution effects, and shares how they established query performance guidelines across the team.'
    },
    rubricNotes: 'Unscored reflection. Look for candid analytical self-evaluation, diagnostic methodology, and growth mindset.'
  },

  // ===================== INTERMEDIATE QUESTIONS (11 to 20) =====================
  {
    id: 'de-i-intro-data-platform',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'icebreaker',
    topics: ['project_tradeoffs'],
    prompt: 'Describe the overall architecture of a data platform or warehouse you worked on. How did you balance batch processing SLAs with the demand for real-time analytics across different stakeholder teams?',
    followUp: 'What architectural decision in that platform worked well, and what decision would you re-architect if you started over today?',
    concepts: [
      'Modern data platform components (ingestion, bronze/silver/gold lakehouse tiers, warehouse, semantic layer)',
      'Balancing batch latency (hourly/daily) vs streaming ingestion (Kafka, Kinesis, micro-batches)',
      'Platform architectural trade-offs: cost, complexity, query performance, and developer velocity'
    ],
    anchors: {
      0: 'Cannot describe the data platform architecture beyond a single SQL database.',
      1: 'Describes basic pipeline scripts, lacking clear articulation of storage layers, compute separation, or data serving tiers.',
      2: 'Explains batch and streaming components, but struggles to justify architectural trade-offs or cost implications.',
      3: 'Clearly details comprehensive platform architecture: ingestion mechanisms, medallion lakehouse architecture, transformation orchestration, and access governance.',
      4: 'Visionary data architecture: details decoupled compute/storage, automated data mesh governance, FinOps cost monitoring, and honest technical retrospection.'
    },
    rubricNotes: 'Unscored icebreaker. Look for comprehensive systems-level understanding, pragmatic trade-off analysis, and clear communication.'
  },
  {
    id: 'de-i-batch-vs-streaming-lambda-kappa',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['concurrency', 'reliability'],
    prompt: 'Compare the Lambda architecture and Kappa architecture for modern data processing. In what real-world scenarios would you choose streaming with tools like Kafka and Flink over scheduled micro-batch processing?',
    followUp: 'What are the operational challenges of maintaining duplicate business logic in Lambda architecture\'s batch and speed layers?',
    concepts: [
      'Lambda Architecture: dual-path (speed layer for real-time + batch layer for accuracy and reconciliation)',
      'Kappa Architecture: single streaming engine (e.g. Flink, Spark Streaming) processing all data as an append-only log with replaying capabilities',
      'Trade-offs: operational overhead of dual-codebases in Lambda vs stateful stream reprocessing complexity in Kappa'
    ],
    anchors: {
      0: 'Cannot explain Lambda or Kappa architectures; confuses streaming with fast batch jobs.',
      1: 'Knows Lambda has two layers but cannot explain why maintaining two codebases is problematic or how Kappa solves it.',
      2: 'Contrasts Lambda and Kappa accurately, but struggles to evaluate when true low-latency streaming is genuinely needed versus micro-batching.',
      3: 'Provides clear comparative analysis: details speed vs batch layers, explains why Kappa uses unified stream processing with log replay, and identifies valid streaming use cases (fraud detection, real-time bidding).',
      4: 'System mastery: details exactly-once processing semantics (Flink checkpoints, Kafka two-phase commit), watermarking, event-time vs processing-time skew, and state size management.'
    },
    rubricNotes: 'Technical scoring guidance. Tests real-time streaming patterns, distributed processing architectures, and stateful stream management.'
  },
  {
    id: 'de-i-lakehouse-acid-transactions',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['databases', 'concurrency'],
    prompt: 'How do modern open table formats (such as Delta Lake, Apache Iceberg, or Apache Hudi) provide ACID transactions, time travel, and concurrent write guarantees on top of cheap object storage like Amazon S3?',
    followUp: 'How does optimistic concurrency control (OCC) resolve conflicts when two pipelines attempt to update the same Iceberg or Delta table simultaneously?',
    concepts: [
      'Open table format mechanics: transaction log (commit log) maintaining immutable metadata pointers to underlying Parquet files',
      'ACID guarantees: atomicity via log commits, snapshot isolation, and time-travel querying historical snapshots',
      'Optimistic Concurrency Control (OCC): detecting conflicting file-level writes and triggering automated retries'
    ],
    anchors: {
      0: 'Thinks S3 natively supports ACID transactions or believes Delta/Iceberg are proprietary database engines rather than table metadata formats.',
      1: 'Mentions Delta Lake has a log, but cannot explain how metadata files coordinate transactions or how time travel works under the hood.',
      2: 'Explains the transaction log and snapshot isolation, but struggles with concurrency conflict resolution or file compaction (vacuuming).',
      3: 'Clearly details how table formats decouple metadata from data files: atomic commits in transaction log, snapshot manifests, time-travel lookups, and OCC conflict resolution.',
      4: 'Deep storage engine expertise: explains Iceberg manifest lists and partition evolution without rewriting data, copy-on-write vs merge-on-read trade-offs, and file compaction strategies.'
    },
    rubricNotes: 'Technical scoring guidance. Tests deep understanding of modern lakehouse storage engines, metadata management, and distributed transaction semantics.'
  },
  {
    id: 'de-i-scd-type2-modeling',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['databases'],
    prompt: 'Explain how you implement Slowly Changing Dimensions Type 2 (SCD2) in an analytical warehouse. How do you manage effective date ranges, active row flags, and high-performance surrogate key lookups during pipeline merges?',
    followUp: 'What are the performance implications of running large-scale MERGE statements against multi-million row fact and dimension tables, and how do you optimize them?',
    concepts: [
      'Slowly Changing Dimensions (SCD): Type 1 (overwrite), Type 2 (historical tracking with valid_from, valid_to, is_current flags)',
      'Pipeline implementation: MERGE (UPSERT) statements detecting attribute changes, expiring old records, and inserting new active rows',
      'Optimization strategies: hashing attribute columns (MD5/SHA256) to detect changes rapidly without comparing dozens of text columns'
    ],
    anchors: {
      0: 'Cannot differentiate SCD Type 1 from Type 2; suggests overwriting dimension rows without preserving historical audit trails.',
      1: 'Explains SCD Type 2 conceptually but cannot describe the SQL MERGE logic or date windowing necessary to maintain integrity.',
      2: 'Describes SCD Type 2 with start/end dates, but does not use hash comparisons or partition pruning, leading to slow table scans.',
      3: 'Implements production-grade SCD Type 2: explains MERGE logic, surrogate keys vs natural keys, valid_from/valid_to timestamps, active boolean flags, and surrogate key assignment.',
      4: 'Advanced dimensional modeling: details surrogate key generation at scale, hash-diff change detection, snapshot-based dbt implementations, and downstream point-in-time join performance.'
    },
    rubricNotes: 'Technical scoring guidance. Evaluates dimensional modeling mastery, historical data tracking, and merge performance tuning.'
  },
  {
    id: 'de-i-partition-skew-spark',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['concurrency', 'reliability'],
    prompt: 'When processing multi-terabyte datasets in distributed compute engines like Apache Spark, what causes data skew during shuffle operations? How do you diagnose skewed partitions and fix them using techniques like salting, broadcast joins, or adaptive query execution?',
    followUp: 'How does Spark Adaptive Query Execution (AQE) automatically detect and handle skewed joins at runtime without manual code refactoring?',
    concepts: [
      'Data skew: uneven distribution of data across shuffle partitions causing straggler tasks and OutOfMemory (OOM) errors',
      'Diagnostic tools: Spark UI (task execution time distribution, shuffle read sizes across partitions)',
      'Remediation techniques: salting join keys with random numbers, broadcast hash joins for small tables, repartitioning, and Spark AQE skew join handling'
    ],
    anchors: {
      0: 'Cannot explain data skew; believes adding more Spark cluster nodes will automatically solve any hanging or failing job.',
      1: 'Recognizes that a single task takes too long, but does not understand how non-uniform key distribution causes partition skew during shuffle.',
      2: 'Identifies skew in Spark UI, but only knows broadcast joins and cannot explain key salting or AQE configuration.',
      3: 'Accurately diagnoses skew using Spark UI percentiles; explains key salting (appending random suffix to skew key and exploding lookup table); details broadcast join thresholds and AQE.',
      4: 'Deep distributed compute mastery: details shuffle file spill to disk, memory management (execution vs storage memory), custom partitioners, and tuning spark.sql.shuffle.partitions.'
    },
    rubricNotes: 'Technical scoring guidance. Tests distributed compute fundamentals, Spark execution mechanics, and troubleshooting production data skew.'
  },
  {
    id: 'de-i-orchestration-dag-lineage',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'technical',
    topics: ['reliability', 'apis'],
    prompt: 'How do you architect data orchestration workflows using tools like Apache Airflow, Dagster, or Prefect? How do you ensure granular dependency management, dynamic DAG generation, automated retries, and end-to-end data lineage?',
    followUp: 'Why is it considered an anti-pattern to run heavy data transformations directly inside Airflow worker processes rather than delegating to specialized compute engines?',
    concepts: [
      'Workflow orchestration principles: directed acyclic graphs (DAGs), deterministic task dependencies, and parameterization',
      'Separation of orchestration and compute: orchestrator coordinates, external engines (Spark, Snowflake, dbt, Trino) execute',
      'Data observability & lineage: OpenLineage metadata standards, tracking data provenance from ingest to BI dashboard'
    ],
    anchors: {
      0: 'Treats orchestrator as a heavy compute engine, running multi-gigabyte pandas operations inside Airflow tasks until workers crash.',
      1: 'Writes monolithic DAGs with hardcoded credentials and no retry policies, failing silently upon transient network errors.',
      2: 'Designs modular DAGs with retries, but struggles with dynamic generation, state passing (misusing XCom for big datasets), or lineage tracking.',
      3: 'Architects robust orchestration: enforces thin orchestrator pattern (operators invoke cloud compute), dynamic task mapping, exponential backoff retries, and lineage tracking.',
      4: 'Modern data orchestration leader: compares asset-based orchestration (Dagster) with task-based (Airflow), integrates OpenLineage/Marquez, and implements automated backfill mechanics with concurrency limits.'
    },
    rubricNotes: 'Technical scoring guidance. Tests workflow orchestration design, reliable pipeline execution, and data observability architectures.'
  },
  {
    id: 'de-i-project-pipeline-backfill',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'techno_managerial',
    topics: ['databases', 'project_tradeoffs'],
    prompt: 'Walk me through how you planned and executed a massive historical data backfill (e.g. reprocessing 2 years of transactional events) without overwhelming production databases, exceeding cloud warehouse spend budgets, or disrupting daily live jobs.',
    followUp: 'How did you validate that the backfilled historical metrics exactly matched the existing legacy reports before switching consumer dashboards over?',
    concepts: [
      'Backfill strategy: chunking historical time slices, rate-limiting read operations against OLTP replicas, and isolated compute clusters',
      'Cost and resource management: leveraging spot instances, off-peak compute, and monitoring query credit burn rate',
      'Verification & reconciliation: automated statistical parity tests between historical and newly processed tables'
    ],
    anchors: {
      0: 'Ran the entire multi-year backfill in a single massive query during peak hours, crashing production databases and exhausting monthly cloud budgets.',
      1: 'Backfilled data manually in ad-hoc chunks without tracking completed dates, leaving gaps and duplicate data in historical reporting.',
      2: 'Scripted chunked backfills successfully, but lacked cost controls, throttling against source databases, or formal parity validation.',
      3: 'Executed structured backfill plan: chunked by partition slices, read from read-replicas with concurrency limits, used dedicated compute pools, and ran automated data reconciliation tests.',
      4: 'Exceptional project execution: created automated backfill CLI with checkpoint state storage, negotiated off-peak cloud billing, ran automated statistical diffs, and coordinated seamless zero-downtime cutover.'
    },
    rubricNotes: 'Techno-managerial scoring guidance. Evaluates large-scale operational planning, risk mitigation, cloud financial awareness, and data validation.'
  },
  {
    id: 'de-i-project-warehouse-cost',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'techno_managerial',
    topics: ['databases', 'project_tradeoffs'],
    prompt: 'Describe a situation where cloud data warehouse costs (such as Snowflake, BigQuery, or Databricks) spiked unexpectedly. How did you audit warehouse compute clustering, auto-suspend policies, clustering keys, and expensive queries to reduce billing without hurting query response times?',
    followUp: 'How do you institute FinOps practices and resource quotas so individual BI teams or data scientists don\'t accidentally run unbounded full-table scans?',
    concepts: [
      'Cloud data warehouse FinOps: compute credits vs storage billing, auto-suspend / auto-resume configuration, and warehouse sizing',
      'Query optimization for cost: clustering keys, partition pruning, materialized views, and eliminating recurrent Cartesian products',
      'Governance: warehouse resource monitors, statement timeouts, per-team cost attribution, and BI cache layer enforcement'
    ],
    anchors: {
      0: 'Unaware of cloud warehouse billing models; ignores cost spikes until executive management demands immediate budget cuts.',
      1: 'Reduced costs simply by shutting down warehouses or downgrading sizes, causing critical business dashboards to time out.',
      2: 'Identified top 5 expensive queries using account usage views, but did not implement systemic governance or automated guardrails.',
      3: 'Audited billing metadata: adjusted auto-suspend from 10 mins to 60 secs, added query timeout limits, optimized expensive query plans, and saved substantial cloud spend.',
      4: 'FinOps leadership: established multi-warehouse isolation per business domain, set credit quota alerts, implemented caching layers, and instituted automated query cost governance.'
    },
    rubricNotes: 'Techno-managerial scoring guidance. Tests FinOps mindset, cloud warehouse cost auditing, query performance tuning, and cross-team governance.'
  },
  {
    id: 'de-i-project-central-vs-mesh',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'techno_managerial',
    topics: ['reliability', 'project_tradeoffs'],
    prompt: 'Have you experienced the transition between a centralized data engineering team and a decentralized domain-driven Data Mesh model? How do you balance domain team autonomy with centralized data governance, metadata management, and common tooling?',
    followUp: 'How do you prevent decentralized teams from reinventing the wheel and creating siloed, incompatible data definitions across the organization?',
    concepts: [
      'Data Mesh paradigm: domain-oriented decentralized data ownership, data as a product, self-serve data infrastructure, and federated governance',
      'Central data platform team role: providing platform primitives (CI/CD templates, compute scaffolding, metadata catalog) rather than writing business SQL',
      'Federated computational governance: global standards for schema definitions, access control, and interoperability across domain data products'
    ],
    anchors: {
      0: 'Cannot articulate the difference between a centralized data team and a Data Mesh; views data engineering purely as a ticketing service desk.',
      1: 'Advocates for complete decentralization without any central governance, resulting in chaotic schema incompatibility and broken joins across departments.',
      2: 'Understands Data Mesh principles theoretically, but struggles with the practical balance of platform enablement vs domain ownership.',
      3: 'Articulates clear pragmatic model: central platform team builds self-serve infrastructure and governance guardrails, while domain teams own data products and business SLAs.',
      4: 'Thought leadership in modern data architecture: details automated data contract verification in CI, shared enterprise data cataloging, cross-domain semantic interoperability, and cultural change management.'
    },
    rubricNotes: 'Techno-managerial scoring guidance. Evaluates architectural vision, organizational dynamics, data governance, and platform enablement.'
  },
  {
    id: 'de-i-reflect-pipeline-failure',
    role: 'data_engineer',
    level: 'intermediate',
    stage: 'reflection',
    topics: ['reliability', 'project_tradeoffs'],
    prompt: 'Reflect on a critical data incident where corrupted, duplicated, or missing data went unnoticed for days or weeks before downstream business executives caught the discrepancies. What systemic guardrails did you implement to ensure silent data corruption is caught immediately?',
    followUp: 'How did you handle the post-incident retrospective and rebuild trust with business stakeholders who depend on those metrics?',
    concepts: [
      'Silent data failures: pipelines completing with status success (exit code 0) while emitting zero rows, duplicated metrics, or corrupted values',
      'Systemic guardrails: volume anomaly detection, freshness alerts, row count threshold monitors, and automated schema validation',
      'Post-incident leadership: blameless post-mortem, transparent communication, and establishing data reliability SLAs'
    ],
    anchors: {
      0: 'Claims they have never experienced a silent data failure or blames downstream users for not inspecting the numbers closely enough.',
      1: 'Describes a failure but only added a one-off query fix without addressing the systemic lack of monitoring or automated alerting.',
      2: 'Explains the incident and post-fix clearly, but lacks deep reflection on automated data observability or stakeholder trust recovery.',
      3: 'Candidly recounts silent data corruption incident, explains why traditional exit-code monitoring failed, and details systemic observability guardrails installed (freshness, volume, distribution checks).',
      4: 'Exemplary data leadership: articulates deep blameless post-mortem culture, implemented Write-Audit-Publish pattern, created executive data health status pages, and restored organizational confidence.'
    },
    rubricNotes: 'Unscored reflection. Look for authentic vulnerability, deep post-mortem learning, operational rigor, and strategic data governance.'
  }
];
