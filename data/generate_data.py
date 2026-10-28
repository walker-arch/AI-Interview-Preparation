"""
Synthetic Data Generator for InterviewIQ AI
Generates realistic interview answers, resume skills, and job descriptions.
"""
import csv
import random
import os

random.seed(42)

# ============================================================
# 1. INTERVIEW ANSWERS DATA (500+ rows)
# ============================================================

TECHNICAL_QUESTIONS = {
    "Python": [
        "What are Python decorators and how do you use them?",
        "Explain the difference between a list and a tuple in Python.",
        "What is the GIL in Python and how does it affect multithreading?",
        "How does Python's garbage collection work?",
        "What are generators in Python and when would you use them?",
        "Explain list comprehensions vs map/filter in Python.",
        "What is the difference between deepcopy and shallow copy?",
        "How do you handle exceptions in Python?",
        "What are Python's magic/dunder methods?",
        "Explain Python's MRO (Method Resolution Order).",
    ],
    "JavaScript": [
        "What is the difference between let, const, and var?",
        "Explain closures in JavaScript.",
        "What is the event loop in JavaScript?",
        "How does prototypal inheritance work in JavaScript?",
        "What are Promises and how do they differ from callbacks?",
        "Explain async/await in JavaScript.",
        "What is hoisting in JavaScript?",
        "Explain the difference between == and === in JavaScript.",
        "What is the 'this' keyword in JavaScript?",
        "How does event delegation work in JavaScript?",
    ],
    "React": [
        "What is the virtual DOM and how does React use it?",
        "Explain the component lifecycle in React.",
        "What are React hooks and why were they introduced?",
        "How does useState differ from useReducer?",
        "What is prop drilling and how do you avoid it?",
        "Explain the useEffect hook and its cleanup function.",
        "What is React Context API and when should you use it?",
        "How does React's reconciliation algorithm work?",
        "What are Higher-Order Components (HOCs) in React?",
        "Explain the difference between controlled and uncontrolled components.",
    ],
    "System Design": [
        "How would you design a URL shortener like bit.ly?",
        "Design a real-time chat application.",
        "How would you design a notification system?",
        "Design a rate limiter for an API.",
        "How would you design a distributed cache?",
        "Design a social media news feed.",
        "How would you design a file storage service like Dropbox?",
        "Design a search autocomplete system.",
        "How would you design a load balancer?",
        "Design a video streaming platform.",
    ],
    "Data Structures": [
        "Explain the difference between a stack and a queue.",
        "What is a hash table and how does collision handling work?",
        "Explain binary search trees and their time complexities.",
        "What is a graph and what are common graph traversal algorithms?",
        "Explain the difference between BFS and DFS.",
        "What is a heap and when would you use one?",
        "Explain linked lists vs arrays — trade-offs.",
        "What is a trie and where is it used?",
        "Explain dynamic programming with an example.",
        "What is the time complexity of common sorting algorithms?",
    ],
    "Databases": [
        "What is the difference between SQL and NoSQL databases?",
        "Explain database normalization and its forms.",
        "What are database indexes and how do they work?",
        "Explain ACID properties in databases.",
        "What is database sharding and when would you use it?",
        "Explain the CAP theorem.",
        "What are database transactions and isolation levels?",
        "How does a B-tree index work?",
        "What is database replication and its types?",
        "Explain query optimization techniques.",
    ],
}

BEHAVIORAL_QUESTIONS = [
    "Tell me about a time you had a conflict with a coworker.",
    "Describe a situation where you had to meet a tight deadline.",
    "Tell me about a project you're most proud of.",
    "Describe a time when you failed and what you learned.",
    "Tell me about a time you had to learn something quickly.",
    "Describe how you handle disagreements with your manager.",
    "Tell me about a time you showed leadership.",
    "Describe a situation where you had to work with a difficult team member.",
    "Tell me about a time you went above and beyond.",
    "Describe a situation where you had to make a decision with incomplete information.",
    "Tell me about a time you received constructive criticism.",
    "Describe how you prioritize tasks when everything seems urgent.",
    "Tell me about a time you mentored someone.",
    "Describe a situation where you had to adapt to a major change.",
    "Tell me about a time you improved a process.",
]

HR_QUESTIONS = [
    "Why are you looking to leave your current position?",
    "What are your salary expectations?",
    "Where do you see yourself in 5 years?",
    "Why do you want to work at our company?",
    "What is your greatest strength?",
    "What is your greatest weakness?",
    "Tell me about yourself.",
    "Why should we hire you?",
    "What motivates you?",
    "How do you handle stress and pressure?",
    "What are your long-term career goals?",
    "Describe your ideal work environment.",
    "What do you know about our company?",
    "How do you stay current with industry trends?",
    "What questions do you have for us?",
]

# Answer templates by quality level
def generate_excellent_answer(question, topic=None):
    """Generate a high-quality, structured answer."""
    templates = {
        "technical": [
            "That's a great question. {concept} is fundamentally about {explanation}. "
            "To elaborate, there are several key aspects to consider. First, {point1}. "
            "Second, {point2}. In practice, I've used this extensively in my work — "
            "for example, in a recent project, {example}. The key trade-offs to consider are "
            "{tradeoff}. Best practices recommend {best_practice}, and I always ensure "
            "to follow these guidelines in production code.",
            
            "Let me break this down comprehensively. {concept} refers to {explanation}. "
            "There are several important dimensions here. From a theoretical perspective, {point1}. "
            "From a practical standpoint, {point2}. I've encountered this in production environments "
            "where {example}. It's worth noting that {tradeoff}. "
            "The industry standard approach is {best_practice}, which I've found to be highly effective.",
        ],
        "behavioral": [
            "Absolutely. Let me share a specific example using the STAR framework. "
            "The situation was {situation}. My task was to {task}. "
            "The action I took was {action}. I also made sure to {extra_action}. "
            "The result was {result}. Looking back, the key lesson I learned was {lesson}. "
            "This experience has shaped how I approach similar situations — I now always {improvement}.",
            
            "Yes, I can speak to that directly. In my previous role at a tech company, "
            "{situation}. I was responsible for {task}. What I did was {action}, "
            "and I specifically focused on {extra_action}. The outcome was quite positive — "
            "{result}. This taught me that {lesson}, and since then I've consistently applied "
            "this approach with great results.",
        ],
        "hr": [
            "That's an important question and I've given it considerable thought. "
            "{opening}. Specifically, {detail1}. Additionally, {detail2}. "
            "What really draws me to this opportunity is {motivation}. "
            "I believe my background in {background} positions me uniquely to contribute, "
            "and I'm genuinely excited about the possibility of {future_vision}.",
            
            "I appreciate you asking that. {opening}. To give you a fuller picture, {detail1}. "
            "Furthermore, {detail2}. My motivation comes from {motivation}, "
            "and I've consistently demonstrated {background}. Looking ahead, "
            "I see tremendous opportunity in {future_vision}, and I'd love to be part of that journey.",
        ]
    }
    cat = "technical" if topic else ("behavioral" if question in BEHAVIORAL_QUESTIONS else "hr")
    return random.choice(templates[cat]).format(
        concept=topic or "this concept",
        explanation="a powerful mechanism that enables more flexible and maintainable code architecture",
        point1="it provides abstraction and encapsulation of complex behavior",
        point2="it significantly improves code reusability and reduces duplication",
        example="we reduced our codebase by 30% and improved maintainability scores significantly",
        tradeoff="performance versus readability and the complexity of the implementation",
        best_practice="starting with the simplest approach and refactoring when clear patterns emerge",
        situation="we were facing a critical production issue that affected thousands of users",
        task="coordinate the response team and implement a fix within our SLA",
        action="immediately set up a war room, triaged the issue, and delegated subtasks efficiently",
        extra_action="communicate progress updates every 30 minutes to all stakeholders",
        result="we resolved the issue 2 hours ahead of our SLA, and user impact was minimized to under 500 affected sessions",
        lesson="clear communication and structured problem-solving are critical in high-pressure situations",
        improvement="establish clear escalation procedures and maintain runbooks for common failure modes",
        opening="I've been very intentional about my career trajectory and what I'm looking for next",
        detail1="I'm seeking a role where I can both contribute my technical expertise and grow as a leader",
        detail2="the culture and mission of the organization are extremely important to me",
        motivation="the opportunity to solve meaningful problems at scale with talented people",
        background="building high-performance systems and leading cross-functional teams",
        future_vision="driving innovation and making a tangible impact on the product and the team",
    )

def generate_good_answer(question, topic=None):
    templates = {
        "technical": [
            "{concept} is about {explanation}. In my experience, {point1}. "
            "For instance, {example}. One important consideration is {tradeoff}. "
            "I typically follow {best_practice} when working with this.",
            
            "So {concept} basically works by {explanation}. "
            "The main thing to understand is {point1}. "
            "I've used this in projects where {example}. It's important to consider {tradeoff}.",
        ],
        "behavioral": [
            "Sure. In my last role, {situation}. I needed to {task}. "
            "What I did was {action}. The result was {result}. "
            "I learned {lesson} from this experience.",
            
            "Yes, I remember a time when {situation}. My responsibility was {task}. "
            "I handled it by {action}. In the end, {result}.",
        ],
        "hr": [
            "{opening}. I think {detail1}. Also, {detail2}. "
            "I'm particularly interested in {motivation}.",
            
            "Well, {opening}. What's important to me is {detail1}. "
            "I believe {motivation} and I'm excited about this opportunity.",
        ]
    }
    cat = "technical" if topic else ("behavioral" if question in BEHAVIORAL_QUESTIONS else "hr")
    return random.choice(templates[cat]).format(
        concept=topic or "this concept",
        explanation="a fundamental pattern used in software engineering for better code organization",
        point1="it helps separate concerns and makes testing easier",
        example="in a recent project we improved our test coverage by implementing this properly",
        tradeoff="making sure the implementation doesn't add unnecessary complexity",
        best_practice="established patterns and keeping things simple where possible",
        situation="there was a tight deadline for a major feature release",
        task="deliver the feature while maintaining quality standards",
        action="prioritize the critical components, communicate with stakeholders about timeline, and focus the team's efforts",
        result="we delivered on time and the feature was well-received by users",
        lesson="that communication and prioritization are as important as technical skills",
        opening="I've thought about this carefully",
        detail1="growth opportunities and challenging work are really important to me",
        detail2="I value a collaborative team environment",
        motivation="working on problems that make a real difference for users",
    )

def generate_average_answer(question, topic=None):
    templates = {
        "technical": [
            "{concept} is when you {explanation}. It's useful for certain things. "
            "I've used it before in some projects.",
            
            "So basically {concept} is {explanation}. "
            "You use it when you need to do something specific. It can be helpful.",
        ],
        "behavioral": [
            "Yeah, I had a situation like that once. Things were tough but I handled it. "
            "I talked to people and we figured it out. It worked out okay.",
            
            "I think I had something like that happen. I worked hard and "
            "communicated with the team. We got through it eventually.",
        ],
        "hr": [
            "I'm looking for new opportunities. I think this company seems good. "
            "I want to grow in my career.",
            
            "I think I'd be a good fit. I have some experience in this area "
            "and I'm a hard worker.",
        ]
    }
    cat = "technical" if topic else ("behavioral" if question in BEHAVIORAL_QUESTIONS else "hr")
    return random.choice(templates[cat]).format(
        concept=topic or "this",
        explanation="a way to handle things in code more efficiently",
    )

def generate_poor_answer(question, topic=None):
    templates = [
        "I'm not sure about that. I think it's something related to programming.",
        "Umm, I don't really know. I haven't worked with that much.",
        "That's a tough one. I would have to Google it.",
        "I'm not really familiar with that concept.",
        "I think I learned about that in school but I forgot.",
        "Hmm, I'm not sure. Can you give me a hint?",
        "I don't know much about that to be honest.",
        "I've heard of it but couldn't explain it well.",
    ]
    return random.choice(templates)

def generate_interview_answers():
    rows = []
    quality_levels = ["excellent", "good", "average", "poor"]
    gen_funcs = {
        "excellent": generate_excellent_answer,
        "good": generate_good_answer,
        "average": generate_average_answer,
        "poor": generate_poor_answer,
    }
    score_ranges = {
        "excellent": (8.0, 10.0),
        "good": (6.0, 8.0),
        "average": (4.0, 6.0),
        "poor": (1.0, 4.0),
    }
    
    # Technical questions
    for topic, questions in TECHNICAL_QUESTIONS.items():
        for q in questions:
            for quality in quality_levels:
                lo, hi = score_ranges[quality]
                score = round(random.uniform(lo, hi), 1)
                answer = gen_funcs[quality](q, topic)
                rows.append({
                    "question": q,
                    "answer": answer,
                    "category": "technical",
                    "quality_label": quality,
                    "score": score
                })
    
    # Extra technical variations for more data
    for topic, questions in TECHNICAL_QUESTIONS.items():
        for q in random.sample(questions, min(7, len(questions))):
            for _ in range(2):
                quality = random.choice(quality_levels)
                lo, hi = score_ranges[quality]
                score = round(random.uniform(lo, hi), 1)
                answer = gen_funcs[quality](q, topic)
                rows.append({
                    "question": q,
                    "answer": answer,
                    "category": "technical",
                    "quality_label": quality,
                    "score": score
                })
    
    # Behavioral questions
    for q in BEHAVIORAL_QUESTIONS:
        for quality in quality_levels:
            lo, hi = score_ranges[quality]
            score = round(random.uniform(lo, hi), 1)
            answer = gen_funcs[quality](q)
            rows.append({
                "question": q,
                "answer": answer,
                "category": "behavioral",
                "quality_label": quality,
                "score": score
            })
    # Extra behavioral
    for q in BEHAVIORAL_QUESTIONS:
        for _ in range(2):
            quality = random.choice(quality_levels)
            lo, hi = score_ranges[quality]
            score = round(random.uniform(lo, hi), 1)
            answer = gen_funcs[quality](q)
            rows.append({
                "question": q,
                "answer": answer,
                "category": "behavioral",
                "quality_label": quality,
                "score": score
            })
    
    # HR questions
    for q in HR_QUESTIONS:
        for quality in quality_levels:
            lo, hi = score_ranges[quality]
            score = round(random.uniform(lo, hi), 1)
            answer = gen_funcs[quality](q)
            rows.append({
                "question": q,
                "answer": answer,
                "category": "hr",
                "quality_label": quality,
                "score": score
            })
    # Extra HR
    for q in HR_QUESTIONS:
        for _ in range(2):
            quality = random.choice(quality_levels)
            lo, hi = score_ranges[quality]
            score = round(random.uniform(lo, hi), 1)
            answer = gen_funcs[quality](q)
            rows.append({
                "question": q,
                "answer": answer,
                "category": "hr",
                "quality_label": quality,
                "score": score
            })
    
    return rows

# ============================================================
# 2. RESUME SKILLS DATA (400+ rows)
# ============================================================

ROLE_TEMPLATES = {
    "frontend": {
        "skills_pool": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue.js", "Angular", 
                        "Redux", "Webpack", "SASS", "Tailwind CSS", "Bootstrap", "Jest",
                        "Cypress", "Figma", "Responsive Design", "Accessibility", "Next.js",
                        "GraphQL", "REST API", "Git", "npm", "Storybook"],
        "experiences": [
            "Developed responsive web applications using {s1} and {s2} with {s3} for state management. "
            "Implemented pixel-perfect UI designs from Figma mockups, ensuring cross-browser compatibility. "
            "Wrote unit and integration tests using {s4}. Collaborated with backend teams on {s5} integration.",
            
            "Built modern single-page applications with {s1} and {s2}. Utilized {s3} for styling and "
            "maintained a component library. Improved page load performance by 40% through code splitting "
            "and lazy loading. Experienced with {s4} and {s5} for development workflow.",
            
            "Led frontend development for an e-commerce platform using {s1} with {s2}. "
            "Created reusable component libraries and design systems. Implemented {s3} for "
            "responsive layouts. Worked extensively with {s4} and {s5}.",
            
            "Senior frontend engineer with expertise in {s1} and {s2}. Built complex data visualization "
            "dashboards and interactive user interfaces. Mentored junior developers on {s3} best practices. "
            "Proficient in {s4} and {s5} for modern web development.",
        ]
    },
    "backend": {
        "skills_pool": ["Python", "Java", "Node.js", "Express.js", "Django", "Flask", "Spring Boot",
                        "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes",
                        "REST API", "GraphQL", "Microservices", "AWS", "Linux", "Git",
                        "RabbitMQ", "Kafka", "Nginx", "CI/CD"],
        "experiences": [
            "Designed and built scalable backend services using {s1} and {s2}. Managed {s3} databases "
            "serving millions of records. Implemented {s4} for caching and performance optimization. "
            "Deployed services using {s5} and maintained 99.9% uptime.",
            
            "Developed RESTful APIs and microservices architecture using {s1} with {s2} framework. "
            "Integrated {s3} for data persistence and {s4} for message queuing. "
            "Experienced with {s5} for containerization and orchestration.",
            
            "Backend developer specializing in {s1} and {s2}. Built high-throughput data processing "
            "pipelines handling 10K+ requests per second. Used {s3} and {s4} for data storage. "
            "Implemented CI/CD pipelines and deployed on {s5}.",
            
            "Senior backend engineer with strong experience in {s1} and {s2}. "
            "Architected distributed systems using {s3} and {s4}. "
            "Led migration from monolith to microservices. Proficient with {s5} cloud infrastructure.",
        ]
    },
    "fullstack": {
        "skills_pool": ["JavaScript", "TypeScript", "React", "Node.js", "Express.js", "Python",
                        "Django", "PostgreSQL", "MongoDB", "Redis", "Docker", "AWS", "Git",
                        "REST API", "GraphQL", "HTML", "CSS", "Webpack", "Jest", "CI/CD",
                        "Next.js", "Tailwind CSS"],
        "experiences": [
            "Full-stack developer experienced in building end-to-end web applications. "
            "Frontend expertise with {s1} and {s2}, backend development with {s3} and {s4}. "
            "Database management using {s5}. Delivered features from concept to deployment.",
            
            "Built and maintained full-stack applications using {s1} on the frontend and {s2} on the backend. "
            "Managed {s3} databases and implemented {s4} for caching. "
            "Deployed applications using {s5} with automated CI/CD pipelines.",
            
            "Versatile full-stack engineer proficient in {s1}, {s2}, and {s3}. "
            "Developed both client-facing interfaces and server-side APIs. "
            "Worked with {s4} and {s5} for infrastructure and deployment.",
            
            "Senior full-stack developer with {exp} years of experience. Expert in {s1} and {s2} "
            "for frontend, {s3} for backend APIs. Database design with {s4}. "
            "Cloud deployment and DevOps using {s5}.",
        ]
    },
    "data_science": {
        "skills_pool": ["Python", "R", "SQL", "Pandas", "NumPy", "Scikit-learn", "TensorFlow",
                        "PyTorch", "Keras", "Matplotlib", "Seaborn", "Jupyter", "Spark",
                        "Hadoop", "Tableau", "Power BI", "Statistics", "Machine Learning",
                        "Deep Learning", "NLP", "Computer Vision", "AWS SageMaker", "MLflow"],
        "experiences": [
            "Data scientist with expertise in {s1} and {s2} for machine learning model development. "
            "Built predictive models using {s3} achieving 95% accuracy on classification tasks. "
            "Visualization and reporting with {s4}. Experience with {s5} for big data processing.",
            
            "Applied machine learning engineer specializing in {s1} and {s2}. "
            "Developed NLP pipelines for text classification and sentiment analysis using {s3}. "
            "Built data pipelines with {s4} and deployed models using {s5}.",
            
            "Senior data scientist with strong foundations in {s1}, statistical analysis, and {s2}. "
            "Led development of recommendation systems and forecasting models using {s3}. "
            "Data visualization with {s4}. Big data processing using {s5}.",
            
            "ML engineer with {exp} years building production ML systems. Proficient in {s1} and {s2}. "
            "Trained and deployed {s3} models for real-time inference. "
            "Used {s4} for experiment tracking and {s5} for model serving.",
        ]
    },
    "devops": {
        "skills_pool": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Ansible",
                        "Jenkins", "GitHub Actions", "CircleCI", "Linux", "Bash", "Python",
                        "Prometheus", "Grafana", "ELK Stack", "Nginx", "HAProxy",
                        "Helm", "ArgoCD", "GitOps", "Vault", "Consul"],
        "experiences": [
            "DevOps engineer managing cloud infrastructure on {s1} using {s2} for infrastructure as code. "
            "Containerized applications with {s3} and orchestrated using {s4}. "
            "Built CI/CD pipelines with {s5} for automated testing and deployment.",
            
            "Site reliability engineer with expertise in {s1} cloud services and {s2}. "
            "Managed {s3} clusters serving 100+ microservices. "
            "Implemented monitoring and alerting using {s4} and {s5}.",
            
            "Senior DevOps specialist experienced in {s1} and {s2}. Automated infrastructure "
            "provisioning and configuration management using {s3}. "
            "Built observability platforms with {s4} and {s5}.",
            
            "Cloud infrastructure engineer with {exp} years experience. "
            "Expert in {s1}, {s2}, and {s3} for cloud-native deployments. "
            "Monitoring with {s4} and secrets management using {s5}.",
        ]
    },
    "mobile": {
        "skills_pool": ["React Native", "Flutter", "Swift", "Kotlin", "Java", "Dart",
                        "iOS", "Android", "Xcode", "Android Studio", "Firebase",
                        "REST API", "GraphQL", "SQLite", "Realm", "Redux",
                        "TypeScript", "JavaScript", "CI/CD", "App Store", "Google Play",
                        "Push Notifications", "Offline Storage"],
        "experiences": [
            "Mobile developer specializing in {s1} and {s2} development. "
            "Built cross-platform applications serving 50K+ daily active users. "
            "Implemented {s3} for state management and {s4} for backend services. "
            "Published apps on {s5}.",
            
            "Senior mobile engineer with expertise in {s1}. Developed native applications "
            "for {s2} with smooth animations and gesture-based interactions. "
            "Integrated {s3} and {s4}. Experience with {s5} for app distribution.",
            
            "Cross-platform mobile developer using {s1} and {s2}. "
            "Built offline-first applications with {s3} for local data persistence. "
            "Backend integration via {s4}. Deployed using {s5} pipelines.",
            
            "Mobile application developer with {exp} years experience in {s1} and {s2}. "
            "Built high-performance apps with {s3} architecture. "
            "Integrated {s4} services and implemented {s5}.",
        ]
    }
}

def generate_resume_skills():
    rows = []
    for role, config in ROLE_TEMPLATES.items():
        num_entries = 70 if role in ["frontend", "backend", "fullstack"] else 65
        for _ in range(num_entries):
            skills = random.sample(config["skills_pool"], min(random.randint(4, 8), len(config["skills_pool"])))
            template = random.choice(config["experiences"])
            skill_map = {f"s{i+1}": skills[i] for i in range(min(5, len(skills)))}
            skill_map["exp"] = str(random.randint(2, 12))
            try:
                resume_text = template.format(**skill_map)
            except (KeyError, IndexError):
                resume_text = template.format(s1=skills[0], s2=skills[1] if len(skills)>1 else skills[0],
                                               s3=skills[2] if len(skills)>2 else skills[0],
                                               s4=skills[3] if len(skills)>3 else skills[0],
                                               s5=skills[4] if len(skills)>4 else skills[0],
                                               exp=str(random.randint(2, 12)))
            rows.append({
                "resume_text": resume_text,
                "skills": ", ".join(skills),
                "role_category": role,
            })
    return rows

# ============================================================
# 3. JOB DESCRIPTIONS DATA (100+ rows)
# ============================================================

JOB_TEMPLATES = {
    "frontend": [
        {"title": "Frontend Developer", "level": "mid"},
        {"title": "Senior Frontend Engineer", "level": "senior"},
        {"title": "React Developer", "level": "mid"},
        {"title": "Junior Frontend Developer", "level": "junior"},
        {"title": "UI Engineer", "level": "mid"},
        {"title": "Lead Frontend Developer", "level": "senior"},
    ],
    "backend": [
        {"title": "Backend Developer", "level": "mid"},
        {"title": "Senior Backend Engineer", "level": "senior"},
        {"title": "Python Developer", "level": "mid"},
        {"title": "Junior Backend Developer", "level": "junior"},
        {"title": "API Developer", "level": "mid"},
        {"title": "Lead Backend Engineer", "level": "senior"},
    ],
    "fullstack": [
        {"title": "Full Stack Developer", "level": "mid"},
        {"title": "Senior Full Stack Engineer", "level": "senior"},
        {"title": "Junior Full Stack Developer", "level": "junior"},
        {"title": "MERN Stack Developer", "level": "mid"},
        {"title": "Full Stack Lead", "level": "senior"},
    ],
    "data_science": [
        {"title": "Data Scientist", "level": "mid"},
        {"title": "Senior Data Scientist", "level": "senior"},
        {"title": "ML Engineer", "level": "mid"},
        {"title": "Junior Data Analyst", "level": "junior"},
        {"title": "Lead ML Engineer", "level": "senior"},
        {"title": "AI Research Engineer", "level": "senior"},
    ],
    "devops": [
        {"title": "DevOps Engineer", "level": "mid"},
        {"title": "Senior DevOps Engineer", "level": "senior"},
        {"title": "Cloud Engineer", "level": "mid"},
        {"title": "Junior DevOps Engineer", "level": "junior"},
        {"title": "SRE Lead", "level": "senior"},
    ],
    "mobile": [
        {"title": "Mobile Developer", "level": "mid"},
        {"title": "Senior iOS Developer", "level": "senior"},
        {"title": "Android Developer", "level": "mid"},
        {"title": "Junior Mobile Developer", "level": "junior"},
        {"title": "React Native Developer", "level": "mid"},
    ],
}

DESCRIPTION_TEMPLATES = [
    "We are looking for a talented {title} to join our growing engineering team. "
    "You will be responsible for {responsibility}. The ideal candidate has strong experience "
    "with {tech1} and {tech2}, and is passionate about building high-quality software. "
    "You'll work closely with {collab} to deliver features that impact millions of users.",
    
    "Join our innovative team as a {title}! In this role, you'll {responsibility}. "
    "We're looking for someone with deep knowledge of {tech1} and hands-on experience with {tech2}. "
    "Collaboration with {collab} is essential. This is an opportunity to make a real impact.",
    
    "We are seeking an experienced {title} to help us scale our platform. "
    "Your primary focus will be {responsibility}. Strong proficiency in {tech1} and {tech2} "
    "is required. You will collaborate with {collab} to deliver robust solutions.",
]

RESPONSIBILITIES = {
    "frontend": "designing and implementing user interfaces that are intuitive and performant",
    "backend": "building scalable APIs and services that handle high-volume traffic",
    "fullstack": "developing end-to-end features across the entire technology stack",
    "data_science": "building and deploying machine learning models to solve business problems",
    "devops": "managing cloud infrastructure and building CI/CD pipelines for reliable deployments",
    "mobile": "developing high-quality mobile applications with excellent user experiences",
}

COLLABORATORS = [
    "cross-functional teams including product managers, designers, and QA engineers",
    "product and design teams to translate requirements into technical solutions",
    "engineering leads and architects to define system design and technical direction",
]

def generate_job_descriptions():
    rows = []
    for category, jobs in JOB_TEMPLATES.items():
        skills_pool = ROLE_TEMPLATES[category]["skills_pool"]
        for job in jobs:
            for _ in range(random.randint(3, 4)):
                template = random.choice(DESCRIPTION_TEMPLATES)
                skills = random.sample(skills_pool, min(5, len(skills_pool)))
                desc = template.format(
                    title=job["title"],
                    responsibility=RESPONSIBILITIES[category],
                    tech1=skills[0],
                    tech2=skills[1],
                    collab=random.choice(COLLABORATORS),
                )
                rows.append({
                    "title": job["title"],
                    "description": desc,
                    "required_skills": ", ".join(skills),
                    "category": category,
                    "experience_level": job["level"],
                })
    return rows

# ============================================================
# MAIN: Generate and save all datasets
# ============================================================

if __name__ == "__main__":
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Interview answers
    answers = generate_interview_answers()
    random.shuffle(answers)
    with open(os.path.join(base_dir, "interview_answers.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["question", "answer", "category", "quality_label", "score"])
        writer.writeheader()
        writer.writerows(answers)
    print(f"Generated {len(answers)} interview answers")
    
    # Resume skills
    resumes = generate_resume_skills()
    random.shuffle(resumes)
    with open(os.path.join(base_dir, "resume_skills.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["resume_text", "skills", "role_category"])
        writer.writeheader()
        writer.writerows(resumes)
    print(f"Generated {len(resumes)} resume entries")
    
    # Job descriptions
    jobs = generate_job_descriptions()
    random.shuffle(jobs)
    with open(os.path.join(base_dir, "job_descriptions.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["title", "description", "required_skills", "category", "experience_level"])
        writer.writeheader()
        writer.writerows(jobs)
    print(f"Generated {len(jobs)} job descriptions")
    
    print("All datasets generated successfully!")
