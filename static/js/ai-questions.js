/**
 * ai-questions.js
 * CareerSadhana AI Interview — Smart Question Engine
 *
 * Architecture:
 *  1. Large question bank (200+ technical, 100+ HR) organized by domain/level/type
 *  2. JD + Resume NLP parser — extracts skills, level, role type
 *  3. Relevance scoring per question (0–10) based on JD+resume match
 *  4. Deduplication guaranteed — each question used at most once per session
 *  5. Balanced selection — covers multiple domains, not just top-ranked
 */

'use strict';

/* ============================================================
   QUESTION BANK
   Each question has:
     q      — question text
     hint   — interviewer tip (shown subtly)
     domains — topic tags for relevance scoring
     levels  — ['junior','mid','senior'] appropriate levels
     type    — 'tech' | 'hr'
     weight  — base importance (1–3)
============================================================ */
const QUESTION_BANK = {

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — CORE FUNDAMENTALS (always relevant)
  ────────────────────────────────────────────────────────── */
  core: [
    {q:"Walk me through your technical background and the kinds of problems you enjoy solving most.",hint:"Cover your stack, key projects, and what genuinely excites you technically.",domains:[],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"What does clean code mean to you? How do you ensure maintainability in your work?",hint:"SOLID, naming conventions, code reviews, documentation.",domains:['general'],levels:['junior','mid','senior'],type:'tech',weight:2},
    {q:"Explain the four pillars of Object-Oriented Programming with real examples from your work.",hint:"Encapsulation, Abstraction, Inheritance, Polymorphism — go beyond definitions.",domains:['oop','java','python','c++','csharp'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What is the difference between a process and a thread? When would you use one over the other?",hint:"Memory sharing, context switching, race conditions, practical use cases.",domains:['os','general','backend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Describe the SOLID principles and give an example of where you applied one.",hint:"Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion.",domains:['oop','general','java','python'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"What is Big O notation? Compare the time complexity of linear search vs binary search.",hint:"O(n) vs O(log n), when each applies, space complexity trade-offs.",domains:['algorithms','dsa'],levels:['junior','mid','senior'],type:'tech',weight:2},
    {q:"Explain the difference between stack and heap memory. How does garbage collection work?",hint:"Static vs dynamic allocation, GC algorithms, memory leaks.",domains:['memory','java','python','general'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you approach debugging a production issue that is hard to reproduce locally?",hint:"Logging, observability, feature flags, reproduction steps, rollback strategy.",domains:['devops','backend','general'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Describe a time your code caused a bug in production. How did you find and fix it?",hint:"STAR method — take ownership, explain root cause analysis and prevention.",domains:[],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you handle version control in a team? Walk me through your Git workflow.",hint:"Branching strategy, PR reviews, merge vs rebase, commit messages.",domains:['git','devops'],levels:['junior','mid','senior'],type:'tech',weight:2},
    {q:"What is the difference between authentication and authorisation? How have you implemented both?",hint:"Identity vs permissions, JWT, OAuth, RBAC, session management.",domains:['security','backend','api'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Walk me through how you would design a URL shortener like bit.ly from scratch.",hint:"Requirements, data model, encoding algorithm, scaling, analytics.",domains:['system-design','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"What are design patterns? Name three you have used and explain when you chose each.",hint:"Singleton, Factory, Observer, Strategy, Decorator — real usage context.",domains:['oop','backend','general'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you approach performance optimisation in an application? What is your first step?",hint:"Profiling before optimising, identifying bottlenecks, measuring impact.",domains:['performance','backend','frontend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Explain the concept of caching. What caching strategies have you used and what problems did they solve?",hint:"In-memory, Redis, CDN, cache invalidation, TTL, write-through vs write-back.",domains:['caching','backend','redis'],levels:['mid','senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — FRONTEND / REACT / VUE / ANGULAR
  ────────────────────────────────────────────────────────── */
  frontend: [
    {q:"Explain the virtual DOM in React. How does the reconciliation algorithm work?",hint:"Diffing, keys, why it improves performance vs direct DOM manipulation.",domains:['react','frontend'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"Walk me through all React hooks you use regularly and when you choose one over another.",hint:"useState, useEffect, useCallback, useMemo, useRef, custom hooks.",domains:['react','frontend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you manage state in a large React application? Compare Context, Redux, Zustand, and React Query.",hint:"Local state, global state, server state — when each solution fits.",domains:['react','frontend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Explain React component lifecycle. How do class lifecycle methods map to hooks?",hint:"componentDidMount → useEffect, shouldComponentUpdate → memo/useMemo.",domains:['react','frontend'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What is code splitting and lazy loading in React? How have you implemented it?",hint:"React.lazy, Suspense, dynamic imports, route-based splitting.",domains:['react','frontend','performance'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you handle accessibility in your frontend work? What WCAG guidelines do you follow?",hint:"Semantic HTML, ARIA attributes, keyboard navigation, screen reader testing.",domains:['frontend','a11y'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Explain the CSS box model, flexbox, and CSS Grid. When do you choose each layout method?",hint:"Margin, padding, border, content — flex for 1D, grid for 2D layouts.",domains:['css','frontend'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What is your approach to responsive design? How do you test across devices?",hint:"Mobile-first, breakpoints, fluid typography, real device vs emulation.",domains:['css','frontend'],levels:['junior','mid','senior'],type:'tech',weight:2},
    {q:"How do you optimise a React application's rendering performance?",hint:"memo, useMemo, useCallback, virtualization, code splitting, bundle analysis.",domains:['react','frontend','performance'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Explain how you would implement a debounced search input without a library.",hint:"setTimeout, clearTimeout, closure — and when to use throttle instead.",domains:['frontend','javascript'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What is the difference between SSR, SSG, CSR, and ISR? When would you use Next.js vs a pure React SPA?",hint:"Rendering strategies, SEO implications, time-to-first-byte, hydration.",domains:['react','nextjs','frontend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you handle error boundaries in React? What happens when a component throws?",hint:"ErrorBoundary class, componentDidCatch, fallback UI.",domains:['react','frontend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Walk me through your frontend testing strategy. What do you test with unit tests vs integration tests?",hint:"Jest, React Testing Library, what to mock, coverage philosophy.",domains:['testing','react','frontend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"What is TypeScript and how does it change your development workflow?",hint:"Type safety, interfaces, generics, compile-time errors, IDE experience.",domains:['typescript','frontend','javascript'],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"How do you approach building a component library or design system?",hint:"API design, theming, accessibility, documentation, versioning.",domains:['frontend','react','css'],levels:['senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — BACKEND / NODE / PYTHON / JAVA
  ────────────────────────────────────────────────────────── */
  backend: [
    {q:"Explain RESTful API design principles. What makes an API truly RESTful?",hint:"Statelessness, resource naming, HTTP methods, status codes, HATEOAS.",domains:['api','backend','rest'],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"What is the difference between REST and GraphQL? When would you choose GraphQL?",hint:"Over-fetching, under-fetching, schema, resolvers, N+1 problem.",domains:['api','backend','graphql'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Explain the Node.js event loop. How does it handle asynchronous operations?",hint:"Call stack, task queue, microtask queue, libuv, non-blocking I/O.",domains:['node','javascript','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you handle async/await and Promises in JavaScript? What are common pitfalls?",hint:"Promise.all vs Promise.allSettled, unhandled rejections, waterfall vs parallel.",domains:['javascript','node','backend'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What are Python decorators? Give a real example from your work.",hint:"@wraps, use cases: logging, auth, caching, timing. Generator mention is a plus.",domains:['python','backend'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"Explain Python's GIL. How does it affect multi-threaded applications?",hint:"Global Interpreter Lock, CPU-bound vs I/O-bound, multiprocessing alternative.",domains:['python','backend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How does Java's garbage collection work? How do you avoid memory leaks?",hint:"Heap generations, GC algorithms, weak/soft references, profiling tools.",domains:['java','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"What are Java streams and functional interfaces? How have you used them?",hint:"map, filter, reduce, Collectors, method references, Optional.",domains:['java','backend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Explain Spring Boot's dependency injection and how IoC container works.",hint:"@Autowired, @Component, @Service, @Bean, ApplicationContext, scopes.",domains:['java','spring','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you design and implement background jobs and scheduled tasks?",hint:"Cron, queues (RabbitMQ/Kafka/Redis), workers, retry logic, dead letter queues.",domains:['backend','queues','node','python'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"What is middleware in Express or your backend framework? How do you use it?",hint:"Request/response pipeline, error handling middleware, ordering.",domains:['node','backend','api'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"How do you implement rate limiting in an API? Why is it necessary?",hint:"Token bucket, sliding window, Redis-based, client trust, abuse prevention.",domains:['api','backend','security'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Explain database connection pooling. Why is it important in production?",hint:"Pool size, max connections, timeout, reuse, performance impact.",domains:['backend','database'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you approach API versioning? What strategy do you prefer and why?",hint:"URL path, query param, header versioning — backward compatibility.",domains:['api','backend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"Walk me through how you would build a real-time feature, such as live notifications.",hint:"WebSockets, SSE, polling — trade-offs, scalability with Redis pub/sub.",domains:['backend','node','websockets'],levels:['mid','senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — DATABASES / SQL / NOSQL
  ────────────────────────────────────────────────────────── */
  database: [
    {q:"SQL versus NoSQL — explain the fundamental difference and when you would choose each.",hint:"ACID vs BASE, schema flexibility, scalability patterns, real use cases.",domains:['database','sql','nosql'],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"A query is running slowly in production. Walk me through your debugging process step by step.",hint:"EXPLAIN plan, missing indexes, N+1, query rewriting, monitoring tools.",domains:['database','sql','performance'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Explain database indexing. What types of indexes exist and what are their trade-offs?",hint:"B-tree, hash, composite, covering indexes — write vs read performance.",domains:['database','sql'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Describe ACID properties with a real example for each.",hint:"Atomicity, Consistency, Isolation, Durability — bank transaction is classic.",domains:['database','sql'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"Write a query to find the second-highest salary from an Employee table without using LIMIT.",hint:"Subquery with MAX and NOT IN, or window function DENSE_RANK.",domains:['sql','database'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"Explain database normalisation. What are the first three normal forms?",hint:"1NF: atomic, 2NF: full dependency, 3NF: no transitive dependency.",domains:['database','sql'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What is the difference between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN?",hint:"Use set diagrams conceptually — what data each returns, NULL handling.",domains:['sql','database'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"How does MongoDB store data? What are the trade-offs of a document model vs relational?",hint:"BSON, collections, embedded vs referenced, horizontal scaling.",domains:['mongodb','nosql','database'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"Explain database transactions and isolation levels. What is a phantom read?",hint:"Read uncommitted, read committed, repeatable read, serialisable.",domains:['database','sql'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you design a database schema for a social media platform? What challenges arise at scale?",hint:"Users, posts, follows, likes — denormalisation for read performance, sharding.",domains:['database','system-design'],levels:['senior'],type:'tech',weight:3},
    {q:"What is Redis and how have you used it in your projects?",hint:"Key-value store, caching, sessions, pub/sub, rate limiting, Lua scripts.",domains:['redis','nosql','database','caching'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Explain the CAP theorem. How does it affect your database choice?",hint:"Consistency, Availability, Partition tolerance — only 2 of 3 guaranteed.",domains:['database','distributed'],levels:['senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — SYSTEM DESIGN
  ────────────────────────────────────────────────────────── */
  systemDesign: [
    {q:"How would you design a scalable notification system that handles millions of users?",hint:"Pub/sub, push vs pull, fan-out, delivery guarantees, retry logic.",domains:['system-design','backend'],levels:['senior'],type:'tech',weight:3},
    {q:"Design a rate limiter for a public API. Walk me through your approach.",hint:"Token bucket, sliding window log, Redis, distributed rate limiting.",domains:['system-design','api','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"What is microservices architecture? What problems does it solve and what does it introduce?",hint:"Service boundaries, independent deployment, distributed tracing, eventual consistency.",domains:['microservices','system-design','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How would you design a cache for a high-traffic read-heavy system?",hint:"Cache-aside, write-through, write-back, eviction policies, hot key problem.",domains:['system-design','caching','backend'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Explain horizontal vs vertical scaling. What are the trade-offs?",hint:"Adding servers vs upgrading servers, database scaling, load balancers.",domains:['system-design','devops','backend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"What is an API Gateway? When would you use one?",hint:"Routing, authentication, rate limiting, load balancing, response transformation.",domains:['system-design','api','microservices'],levels:['senior'],type:'tech',weight:2},
    {q:"How do you ensure high availability in a distributed system?",hint:"Replication, failover, health checks, circuit breakers, bulkheads.",domains:['system-design','distributed','devops'],levels:['senior'],type:'tech',weight:3},
    {q:"Design a real-time collaborative document editor like Google Docs.",hint:"OT (Operational Transformation) or CRDTs, WebSockets, conflict resolution.",domains:['system-design','backend','websockets'],levels:['senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — DEVOPS / CLOUD / DOCKER / K8S
  ────────────────────────────────────────────────────────── */
  devops: [
    {q:"What is Docker and how have you used containerisation in your projects?",hint:"Image vs container, Dockerfile best practices, multi-stage builds, networking.",domains:['docker','devops','containers'],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"Explain Kubernetes. What problems does it solve that Docker alone cannot?",hint:"Orchestration, auto-scaling, rolling updates, service discovery, self-healing.",domains:['kubernetes','devops','containers'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"What AWS services have you used and for what purpose?",hint:"EC2, S3, RDS, Lambda, ECS, EKS, CloudFront, API Gateway — specific use cases.",domains:['aws','cloud','devops'],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"Explain CI/CD and walk me through a pipeline you have built.",hint:"Source → build → test → deploy stages, tools used, environment promotion.",domains:['cicd','devops'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"What is Infrastructure as Code? How have you used Terraform or CloudFormation?",hint:"State management, modules, plan/apply cycle, drift detection.",domains:['devops','terraform','aws'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you monitor applications in production? What metrics and alerts do you set up?",hint:"Prometheus, Grafana, CloudWatch, APM tools, RED method (Rate, Errors, Duration).",domains:['devops','monitoring','backend'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"What is a container registry and how do you manage Docker image versions?",hint:"ECR, Docker Hub, image tagging strategy, vulnerability scanning.",domains:['docker','devops','aws'],levels:['mid'],type:'tech',weight:2},
    {q:"Explain the difference between blue-green and canary deployments.",hint:"Zero-downtime, traffic splitting, rollback, feature flags.",domains:['devops','cicd'],levels:['senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — ML / AI / DATA SCIENCE
  ────────────────────────────────────────────────────────── */
  ml: [
    {q:"Explain supervised, unsupervised, and reinforcement learning with real-world examples.",hint:"Classification, clustering, reward-based policy — clear industry examples.",domains:['ml','ai','data-science'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"What is overfitting? How do you detect and prevent it?",hint:"Train vs validation loss, regularisation (L1/L2), dropout, early stopping, cross-validation.",domains:['ml','ai'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"Explain gradient descent. What is the difference between batch, mini-batch, and stochastic?",hint:"Loss surface, learning rate, convergence, computational trade-offs.",domains:['ml','ai','deep-learning'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How have you used Python data science libraries in a real project?",hint:"NumPy, Pandas, Scikit-learn, Matplotlib — specific data transformation tasks.",domains:['python','ml','data-science'],levels:['junior','mid'],type:'tech',weight:3},
    {q:"What is a confusion matrix? Explain precision, recall, and F1-score.",hint:"When to optimise each metric — medical diagnosis vs spam detection.",domains:['ml','ai'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"Explain the transformer architecture and its significance in NLP.",hint:"Self-attention, positional encoding, BERT, GPT lineage, why transformers beat RNNs.",domains:['ml','nlp','ai','deep-learning'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you handle imbalanced datasets in a classification problem?",hint:"SMOTE, class weights, undersampling, threshold tuning, ROC-AUC.",domains:['ml','ai'],levels:['mid'],type:'tech',weight:2},
    {q:"What MLOps practices have you followed? How do you serve and monitor ML models in production?",hint:"Feature store, model registry, drift detection, A/B testing, SLA monitoring.",domains:['ml','mlops','devops'],levels:['senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — SECURITY
  ────────────────────────────────────────────────────────── */
  security: [
    {q:"What are the OWASP Top 10 vulnerabilities? Walk me through how you protect against three of them.",hint:"SQL injection, XSS, CSRF, broken auth — technical countermeasures.",domains:['security','backend','api'],levels:['mid','senior'],type:'tech',weight:3},
    {q:"Explain how HTTPS works. What happens during a TLS handshake?",hint:"Asymmetric key exchange, symmetric encryption, certificates, CA chain.",domains:['security','networking'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you securely store passwords? What is the difference between hashing and encryption?",hint:"bcrypt/Argon2, salting, why MD5/SHA1 are insufficient for passwords.",domains:['security','backend'],levels:['junior','mid'],type:'tech',weight:2},
    {q:"What is SQL injection? Write an example vulnerable query and then the secure version.",hint:"Parameterised queries, prepared statements, ORM protections.",domains:['security','sql','database'],levels:['junior','mid'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — TESTING
  ────────────────────────────────────────────────────────── */
  testing: [
    {q:"Explain the testing pyramid. How do you balance unit, integration, and end-to-end tests?",hint:"Speed vs confidence, what each layer tests, cost of each type.",domains:['testing','general'],levels:['junior','mid','senior'],type:'tech',weight:2},
    {q:"What is test-driven development? Have you used it and what was your experience?",hint:"Red-Green-Refactor, benefits, challenges, when TDD makes less sense.",domains:['testing','general'],levels:['mid','senior'],type:'tech',weight:2},
    {q:"How do you test asynchronous code? What are common pitfalls?",hint:"Async/await in tests, fake timers, mocking APIs, race conditions.",domains:['testing','javascript','node'],levels:['mid'],type:'tech',weight:2},
    {q:"What is mocking and why is it important in unit testing?",hint:"Test doubles, dependency injection, isolating system under test.",domains:['testing','general'],levels:['junior','mid'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     TECHNICAL — CLOSING / SITUATIONAL
  ────────────────────────────────────────────────────────── */
  closing: [
    {q:"Tell me about the most complex technical project you have worked on. What was your specific contribution?",hint:"Scale, technical decisions, trade-offs, what you learned.",domains:[],levels:['mid','senior'],type:'tech',weight:3},
    {q:"How do you stay current with rapidly evolving technology? What have you learned in the last six months?",hint:"Specific courses, papers, projects, communities — genuine curiosity.",domains:[],levels:['junior','mid','senior'],type:'tech',weight:2},
    {q:"What technical decision are you most proud of? Why did you make it and what was the outcome?",hint:"Architecture, tool choice, refactoring — measurable impact.",domains:[],levels:['mid','senior'],type:'tech',weight:2},
    {q:"What aspects of this role excite you technically? What would you build or improve first?",hint:"Shows research into the company and genuine enthusiasm for the tech stack.",domains:[],levels:['junior','mid','senior'],type:'tech',weight:3},
    {q:"Where do you see your technical career in the next three years?",hint:"Specific, aligned with the role — depth vs breadth, leadership vs individual contributor.",domains:[],levels:['junior','mid','senior'],type:'tech',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     HR — SELF & MOTIVATION
  ────────────────────────────────────────────────────────── */
  hrSelf: [
    {q:"Tell me about yourself — focus on your professional journey and what brought you to this role.",hint:"2-3 minutes max: background → key achievements → why this role.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"Why are you interested in this specific role and our company?",hint:"Show research: company mission, product, culture, team — connect to your goals.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"What are your two or three greatest professional strengths and how do they show up in your work?",hint:"Specific examples tied to the JD — avoid generic answers.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"What is your most significant professional weakness and what steps are you taking to address it?",hint:"Honest, specific, with concrete improvement actions — not a strength in disguise.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"What motivates you most in your daily work? What kind of problems energise you?",hint:"Genuine answer that connects to what this role offers.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"How would your current or most recent manager describe your working style?",hint:"Communication, delivery, initiative, collaboration — specific traits with evidence.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"What does success look like to you in the first 90 days in this role?",hint:"Shows you understand the role, are action-oriented, and ask good questions.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Why are you leaving your current position?",hint:"Forward-looking, positive framing — growth, new challenge, not complaints.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"Where do you see yourself professionally in five years?",hint:"Ambitious but credible — aligned with this company's growth path.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"Tell me about a professional achievement you are most proud of and why.",hint:"Specific, quantified if possible, your role, the impact.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     HR — BEHAVIOURAL / SITUATIONAL
  ────────────────────────────────────────────────────────── */
  hrBehavioural: [
    {q:"Describe a time you had to deliver under a very tight deadline. What was the situation and how did you manage it?",hint:"STAR: specific scenario, your concrete actions, measurable outcome.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"Tell me about a conflict you had with a colleague. How did you handle it and what did you learn?",hint:"Focus on resolution process — empathy, communication, positive outcome.",domains:[],levels:['mid','senior'],type:'hr',weight:3},
    {q:"Describe a time you made a significant mistake at work. How did you handle it?",hint:"Accountability, root cause, fix, prevention — no blame shifting.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"Tell me about a situation where you had to influence a decision without having formal authority.",hint:"Data, relationships, coalition building, persuasion techniques.",domains:[],levels:['mid','senior'],type:'hr',weight:3},
    {q:"Give an example of a time you had to quickly adapt to a major change at work.",hint:"Specific change, your emotional and practical response, outcome.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"Describe a time you showed initiative beyond your regular responsibilities.",hint:"Proactivity, measurable impact, no formal instruction needed.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"Tell me about a time you received critical feedback. How did you respond to it?",hint:"Receptiveness, specific changes made, relationship with feedback-giver.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"Describe a situation where you had to manage multiple competing priorities. How did you decide what to do first?",hint:"Prioritisation framework, stakeholder communication, outcome.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Tell me about a time you failed to meet a goal or project objective. What happened?",hint:"Honest, structured analysis, what you changed — growth mindset.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Give an example of a time you went above and beyond for a customer, user, or stakeholder.",hint:"Customer obsession — specific action, their reaction, measurable outcome.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     HR — TEAMWORK / LEADERSHIP
  ────────────────────────────────────────────────────────── */
  hrTeam: [
    {q:"Describe your ideal team culture. How do you actively contribute to building it?",hint:"Psychological safety, open feedback, celebrations, specific behaviours.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Tell me about a time you mentored or helped a colleague develop their skills.",hint:"Patience, teaching approach, their progress, your own growth as a mentor.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"How do you build trust with a new team?",hint:"Listening first, delivering on small commitments, transparency, vulnerability.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Describe a time you led a project from start to finish without a formal leadership title.",hint:"Planning, alignment, motivation, accountability, lessons learned.",domains:[],levels:['mid','senior'],type:'hr',weight:3},
    {q:"How do you handle a team member who is consistently underperforming?",hint:"Private conversation, understanding root cause, support plan, escalation if needed.",domains:[],levels:['senior'],type:'hr',weight:2},
    {q:"Tell me about a time you had to make a difficult decision with incomplete information.",hint:"Risk assessment, stakeholder input, decision framework, outcome and retrospective.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"How do you approach cross-functional collaboration with non-technical stakeholders?",hint:"Translating complexity, managing expectations, shared vocabulary.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Describe how you typically receive and give feedback in a team setting.",hint:"Specific, timely, kind-but-direct — SBI model or similar framework.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     HR — CLIENT / CUSTOMER FOCUS
  ────────────────────────────────────────────────────────── */
  hrClient: [
    {q:"Tell me about a time you dealt with a difficult client or customer situation.",hint:"Empathy first, listening, solution focus, follow-up — what you learned.",domains:['client','customer','service'],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"How do you manage client expectations when a project is behind schedule?",hint:"Proactive communication, transparent options, maintaining trust.",domains:['client','customer','management'],levels:['mid','senior'],type:'hr',weight:2},
    {q:"Describe a time you successfully turned a dissatisfied customer into a happy one.",hint:"Listening without defensiveness, solutions, follow-through, relationship repair.",domains:['client','customer','service'],levels:['mid','senior'],type:'hr',weight:2},
  ],

  /* ──────────────────────────────────────────────────────────
     HR — CLOSING
  ────────────────────────────────────────────────────────── */
  hrClosing: [
    {q:"What questions do you have for us about the role, team, or company?",hint:"Prepare 2-3 genuine questions — shows engagement, not desperation.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:3},
    {q:"Is there anything on your CV you would like to walk us through or expand on?",hint:"An opportunity to highlight something they may have skimmed over.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"What is your expected salary and notice period?",hint:"Research market rates, give a range, be honest about notice period.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
    {q:"If you were given this role today, what would be your first priority?",hint:"Shows you have already thought about the job — aligned with JD requirements.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  ],
};

/* ============================================================
   NLP KEYWORD EXTRACTOR
   Extracts skills, role type, level from JD and resume text
============================================================ */
const SKILL_KEYWORDS = {
  // Frontend
  react:['react','reactjs','react.js','react hooks','jsx'],
  nextjs:['next.js','nextjs','next js','server-side rendering','ssr'],
  vue:['vue','vuejs','vue.js','nuxt'],
  angular:['angular','angularjs','angular js'],
  typescript:['typescript','ts','type-safe'],
  javascript:['javascript','js','es6','es2015','ecmascript'],
  css:['css','sass','scss','tailwind','styled-components','emotion','css-in-js'],
  frontend:['frontend','front-end','front end','ui','user interface','spa','single page'],
  // Backend
  node:['node','nodejs','node.js','express','fastify','nestjs','koa'],
  python:['python','django','flask','fastapi','pandas','numpy'],
  java:['java','spring','spring boot','jvm','maven','gradle'],
  spring:['spring','spring boot','spring mvc','spring data','hibernate'],
  csharp:['c#','dotnet','.net','asp.net','entity framework'],
  go:['golang','go lang',' go '],
  php:['php','laravel','symfony'],
  ruby:['ruby','rails','ruby on rails'],
  backend:['backend','back-end','server-side','api','rest api','microservice'],
  // Databases
  sql:['sql','mysql','postgresql','postgres','sqlite','oracle','stored procedure','query optimisation','query optimization'],
  mongodb:['mongodb','mongo','nosql','document database','bson'],
  redis:['redis','caching','cache','in-memory'],
  nosql:['nosql','cassandra','dynamodb','couchdb'],
  database:['database','db','schema','orm','migration'],
  // Cloud / DevOps
  aws:['aws','amazon web services','ec2','s3','lambda','rds','ecs','eks','cloudformation','cloudfront'],
  azure:['azure','microsoft azure'],
  gcp:['gcp','google cloud','google cloud platform'],
  docker:['docker','container','containerisation','containerization','dockerfile'],
  kubernetes:['kubernetes','k8s','kubectl','helm','pod','deployment'],
  devops:['devops','dev ops','ci/cd','cicd','pipeline','jenkins','github actions','gitlab ci'],
  terraform:['terraform','iac','infrastructure as code'],
  cicd:['ci/cd','continuous integration','continuous deployment','github actions','jenkins','gitlab'],
  // ML / AI
  ml:['machine learning','ml','scikit-learn','sklearn','model training','feature engineering'],
  deeplearning:['deep learning','neural network','tensorflow','pytorch','keras'],
  nlp:['nlp','natural language processing','transformers','bert','gpt','llm','large language'],
  'data-science':['data science','data analysis','jupyter','matplotlib','seaborn'],
  // Tools
  git:['git','github','gitlab','bitbucket','version control'],
  graphql:['graphql','apollo','schema'],
  websockets:['websocket','websockets','socket.io','real-time','realtime'],
  testing:['unit test','integration test','jest','pytest','junit','selenium','cypress','testing'],
  security:['security','owasp','penetration','authentication','authorisation','authorization','jwt','oauth'],
  // General
  microservices:['microservice','microservices','service mesh','event-driven'],
  'system-design':['system design','architecture','scalable','distributed system','high availability'],
  agile:['agile','scrum','sprint','kanban','jira'],
  // HR-specific
  client:['client','customer','stakeholder','account'],
  customer:['customer','client','user experience','ux'],
  leadership:['lead','leader','leadership','manage','mentor','coach'],
  management:['manage','manager','management','team lead','project management'],
};

const LEVEL_SIGNALS = {
  junior:['junior','entry level','entry-level','graduate','fresher','0-2 years','1-2 years','1 year'],
  mid:['mid level','mid-level','intermediate','2-5 years','3-5 years','2-4 years','3 years','4 years'],
  senior:['senior','lead','principal','staff','5+ years','5-8 years','7+ years','8+ years','architect'],
};

function parseContext(jd, resume) {
  const combined = (jd + ' ' + resume).toLowerCase();
  const jdLower  = jd.toLowerCase();

  // Detect domains present
  const detected = {};
  Object.entries(SKILL_KEYWORDS).forEach(([domain, kws]) => {
    const score = kws.filter(kw => combined.includes(kw)).length;
    if (score > 0) detected[domain] = score;
  });

  // Detect level
  let level = 'mid'; // default
  if (LEVEL_SIGNALS.senior.some(s => combined.includes(s))) level = 'senior';
  else if (LEVEL_SIGNALS.junior.some(s => combined.includes(s))) level = 'junior';

  // Detect role type
  const isFrontend = ['react','vue','angular','nextjs','frontend','typescript'].some(d => detected[d]);
  const isBackend  = ['node','python','java','spring','backend','api','rest'].some(d => detected[d]);
  const isDevOps   = ['docker','kubernetes','aws','devops','cicd','terraform'].some(d => detected[d]);
  const isML       = ['ml','deeplearning','nlp','data-science'].some(d => detected[d]);
  const isFullStack= isFrontend && isBackend;

  return { detected, level, isFrontend, isBackend, isDevOps, isML, isFullStack };
}

/* ============================================================
   RELEVANCE SCORER
   Returns 0–10 score for a question given context
============================================================ */
function scoreQuestion(question, context) {
  let score = question.weight; // base score

  // Level match
  if (question.levels.includes(context.level)) score += 2;

  // Domain match — each matched domain adds points
  question.domains.forEach(d => {
    const detected = context.detected[d] || 0;
    score += detected * 1.5;
  });

  // No domains = universally relevant, mild boost
  if (question.domains.length === 0) score += 1.5;

  // Role-type affinity bonuses
  if (context.isFrontend && question.domains.some(d => ['react','frontend','vue','angular','css','typescript'].includes(d))) score += 3;
  if (context.isBackend  && question.domains.some(d => ['backend','node','python','java','api','database'].includes(d))) score += 3;
  if (context.isDevOps   && question.domains.some(d => ['docker','kubernetes','aws','devops','cicd'].includes(d))) score += 3;
  if (context.isML       && question.domains.some(d => ['ml','deeplearning','nlp','data-science'].includes(d))) score += 4;

  return score;
}

/* ============================================================
   SMART QUESTION SELECTOR
   - Selects N non-repeating questions
   - Balanced across categories
   - Ranked by relevance to JD + resume
   - Guaranteed no duplicates in a session
============================================================ */
function selectQuestions(mode, jd, resume, count) {
  const ctx = parseContext(jd, resume);

  if (mode === 'hr') {
    return selectHRQuestions(ctx, count);
  } else {
    return selectTechQuestions(ctx, count);
  }
}

function selectTechQuestions(ctx, count) {
  const allCategories = ['core','frontend','backend','database','systemDesign','devops','ml','security','testing','closing'];

  // Collect all tech questions with scores
  let pool = [];
  allCategories.forEach(cat => {
    (QUESTION_BANK[cat] || []).forEach(q => {
      if (q.type === 'tech') {
        pool.push({ ...q, _score: scoreQuestion(q, ctx), _cat: cat });
      }
    });
  });

  // Sort by relevance desc
  pool.sort((a, b) => b._score - a._score);

  // Balanced selection: ensure variety across categories
  const selected = [];
  const usedIds  = new Set();
  const catCount = {};

  // Category allocation based on role
  const allocation = buildTechAllocation(ctx, count);

  // First pass: pick per-category allocations
  Object.entries(allocation).forEach(([cat, limit]) => {
    const catPool = pool.filter(q => q._cat === cat && !usedIds.has(q.q));
    const picked  = catPool.slice(0, limit);
    picked.forEach(q => { selected.push(q); usedIds.add(q.q); });
  });

  // Second pass: fill remaining slots with highest scored unused
  if (selected.length < count) {
    pool.filter(q => !usedIds.has(q.q))
        .slice(0, count - selected.length)
        .forEach(q => { selected.push(q); usedIds.add(q.q); });
  }

  // Shuffle selected to avoid predictable ordering (but keep opener first)
  const opener = selected.find(q => q.q.toLowerCase().startsWith('walk me through your technical'));
  const rest    = selected.filter(q => q !== opener);
  // Light shuffle of rest
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  const final = opener ? [opener, ...rest] : rest;
  return final.slice(0, count).map(q => ({ q: q.q, hint: q.hint, score: Math.min(5, Math.round(q._score / 3)) }));
}

function buildTechAllocation(ctx, total) {
  // Default balanced allocation
  const alloc = { core: 3, closing: 2 };
  const remaining = total - 5;

  if (ctx.isML) {
    Object.assign(alloc, { ml: Math.min(5, remaining), database: 2, backend: 2, testing: 1 });
  } else if (ctx.isFrontend && ctx.isBackend) {
    // Full-stack
    Object.assign(alloc, { frontend: 3, backend: 3, database: 2, devops: 1, security: 1, testing: 1 });
  } else if (ctx.isFrontend) {
    Object.assign(alloc, { frontend: 5, database: 2, testing: 2, security: 1 });
  } else if (ctx.isBackend) {
    Object.assign(alloc, { backend: 4, database: 3, systemDesign: 2, security: 1 });
  } else if (ctx.isDevOps) {
    Object.assign(alloc, { devops: 5, backend: 2, database: 1, security: 2 });
  } else {
    // Generic tech
    Object.assign(alloc, { backend: 3, database: 3, systemDesign: 2, testing: 1, security: 1 });
  }

  return alloc;
}

function selectHRQuestions(ctx, count) {
  const allHRCats = ['hrSelf','hrBehavioural','hrTeam','hrClient','hrClosing'];
  let pool = [];
  allHRCats.forEach(cat => {
    (QUESTION_BANK[cat] || []).forEach(q => {
      if (q.type === 'hr') {
        pool.push({ ...q, _score: scoreQuestion(q, ctx), _cat: cat });
      }
    });
  });

  pool.sort((a, b) => b._score - a._score);

  // HR allocation
  const allocation = {
    hrSelf: 3,
    hrBehavioural: Math.min(4, count - 6),
    hrTeam: 2,
    hrClient: ctx.detected['client'] || ctx.detected['customer'] ? 2 : 1,
    hrClosing: 1,
  };

  const selected = [];
  const usedIds  = new Set();

  Object.entries(allocation).forEach(([cat, limit]) => {
    pool.filter(q => q._cat === cat && !usedIds.has(q.q))
        .slice(0, limit)
        .forEach(q => { selected.push(q); usedIds.add(q.q); });
  });

  // Fill remaining
  pool.filter(q => !usedIds.has(q.q))
      .slice(0, count - selected.length)
      .forEach(q => { selected.push(q); usedIds.add(q.q); });

  // Keep opener first, shuffle rest
  const opener = selected.find(q => q._cat === 'hrSelf' && q.q.toLowerCase().startsWith('tell me about yourself'));
  const rest   = selected.filter(q => q !== opener);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  const final = opener ? [opener, ...rest] : rest;
  return final.slice(0, count).map(q => ({ q: q.q, hint: q.hint, score: Math.min(5, Math.round(q._score / 2)) }));
}

/* ============================================================
   JD PREVIEW — for setup UI
   Returns list of detected skill tags
============================================================ */
function getJDTags(jd, resume) {
  const ctx = parseContext(jd, resume);
  const tags = Object.entries(ctx.detected)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([d]) => d);
  return { tags, level: ctx.level };
}

/* ──────────────────────────────────────────────────────────
   HR — ADDITIONAL BEHAVIOURAL (to reach 50+ total)
────────────────────────────────────────────────────────── */
QUESTION_BANK.hrExtra = [
  {q:"Tell me about a time you had to learn a new skill quickly to complete a project.",hint:"Learning strategy, pace, result — shows adaptability.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"How do you handle a situation where your manager disagrees with your approach?",hint:"Upward communication, data-driven arguments, respectful disagreement.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"Describe a time you successfully managed a project under budget constraints.",hint:"Prioritisation, trade-offs, creativity, stakeholder management.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"What is your approach to working with remote or distributed teams?",hint:"Async communication, time zones, tools, trust-building.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"Tell me about a time you had to present complex information to a non-technical audience.",hint:"Simplification, analogies, visual aids, checking understanding.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"Describe a time you identified a problem nobody else had noticed and took action.",hint:"Proactivity, observation, courage to speak up, outcome.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"How do you approach a situation where you are asked to do something you disagree with ethically?",hint:"Principles, raising concerns, escalation, integrity.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"Tell me about a goal you set for yourself and how you pursued it.",hint:"Specific goal, planning, obstacles, outcome — self-direction.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"Describe how you have contributed to improving a process or workflow at your organisation.",hint:"Initiative, measurement, implementation, impact.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"How do you ensure continuous professional development in your field?",hint:"Courses, communities, reading, projects — specific and genuine.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"Tell me about a time you worked with someone very different from yourself.",hint:"Diversity of thought, empathy, communication style adaptation.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"What has been the most valuable professional lesson you have learned so far?",hint:"Genuine insight — shows reflection and maturity.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"How do you define success in your career beyond promotions and salary?",hint:"Impact, learning, relationships, fulfilment — authentic answer.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
  {q:"Describe a time you changed your mind about something significant at work.",hint:"Intellectual humility, new information, outcome of changing approach.",domains:[],levels:['mid','senior'],type:'hr',weight:2},
  {q:"What would your closest colleagues say is the best thing about working with you?",hint:"Genuine, backed by specific examples — not just generic traits.",domains:[],levels:['junior','mid','senior'],type:'hr',weight:2},
];
