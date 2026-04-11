"""
AI Career Guidance Platform - Python LLM Service
Advanced Career Data Analysis and Recommendation Engine
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
import json
import logging
import asyncio
from enum import Enum
import numpy as np
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Career Guidance LLM Service",
    description="Advanced Python-based LLM service for career path analysis and recommendations",
    version="2.0.0"
)

# ==================== Data Models ====================

class EducationLevel(str, Enum):
    TENTH = "10th"
    TWELFTH = "12th"
    DIPLOMA = "Diploma"
    DEGREE = "Degree"
    ITI = "ITI"
    CERTIFICATE = "Certificate"

class Category(str, Enum):
    EDUCATION = "education"
    STREAM = "stream"
    DEGREE = "degree"
    SPECIALIZATION = "specialization"
    CAREER = "career"
    JOB = "job"
    CERTIFICATION = "certification"

class DemandLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class SalaryRange(BaseModel):
    entry: str
    mid: str
    senior: str
    abroad: Optional[str] = None

class CareerMetadata(BaseModel):
    averageSalary: SalaryRange
    growthRate: int = Field(ge=0, le=100)
    skills: List[str]
    educationPath: List[str]
    growthOpportunities: List[str]
    topRecruiters: Optional[List[str]] = []
    workEnvironment: Optional[str] = ""
    futureOutlook: Optional[str] = ""
    relatedCareers: Optional[List[str]] = []
    recommendedCourses: Optional[List[str]] = []
    governmentExams: Optional[List[str]] = []

class CareerNode(BaseModel):
    nodeId: str
    label: str
    category: Category
    description: str
    duration: str
    eligibility: str
    demand: DemandLevel
    metadata: CareerMetadata
    educationLevel: Optional[str] = None
    parentNodeId: Optional[str] = None
    depth: int = 0
    children: List[str] = []

class CareerPathRequest(BaseModel):
    educationLevel: EducationLevel
    userId: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = {}

class NodeExpandRequest(BaseModel):
    sessionId: Optional[str] = None
    userId: Optional[str] = None

class CareerDetailsRequest(BaseModel):
    nodeId: str
    language: Optional[str] = "en"

# ==================== Career Database ====================

class CareerDatabase:
    """Professional career database with comprehensive Indian career pathways"""
    
    def __init__(self):
        self.career_paths = self._initialize_database()
    
    def _initialize_database(self) -> Dict:
        """Initialize comprehensive career database"""
        return {
            "10th": self._get_10th_paths(),
            "12th": self._get_12th_paths(),
            "Diploma": self._get_diploma_paths(),
            "Degree": self._get_degree_paths(),
            "ITI": self._get_iti_paths(),
            "Certificate": self._get_certificate_paths()
        }
    
    def _get_10th_paths(self) -> List[Dict]:
        """Career paths after 10th standard"""
        return [
            {
                "nodeId": "10th-puc-science",
                "label": "PUC Science (PCMB/PCMC)",
                "category": "stream",
                "description": "Pre-University Course in Science stream with Physics, Chemistry, Mathematics/Biology combinations",
                "duration": "2 years",
                "eligibility": "Pass 10th Standard with minimum 50-60% marks",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-5 LPA", "mid": "8-15 LPA", "senior": "15-30 LPA"},
                    "growthRate": 85,
                    "skills": ["Analytical Thinking", "Problem Solving", "Mathematics", "Scientific Temper"],
                    "educationPath": ["Complete 10th with good marks", "Join PUC Science", "Prepare for competitive exams (JEE/NEET)", "Pursue Engineering/Medical"],
                    "growthOpportunities": ["Engineering Services", "Medical Field", "Research & Development", "Data Science"],
                    "topRecruiters": ["IITs", "AIIMS", "ISRO", "DRDO", "TCS", "Infosys"],
                    "futureOutlook": "Excellent prospects in emerging fields like AI, Robotics, Biotechnology"
                }
            },
            {
                "nodeId": "10th-puc-commerce",
                "label": "PUC Commerce",
                "category": "stream",
                "description": "Pre-University Course in Commerce with Accountancy, Business Studies, Economics, and Statistics",
                "duration": "2 years",
                "eligibility": "Pass 10th Standard",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-5 LPA", "mid": "6-12 LPA", "senior": "12-25 LPA"},
                    "growthRate": 78,
                    "skills": ["Numerical Ability", "Financial Literacy", "Business Acumen", "Analytical Skills"],
                    "educationPath": ["Complete 10th", "Join PUC Commerce", "Pursue B.Com/CA/CS", "Specialize in Finance/Accounting"],
                    "growthOpportunities": ["Chartered Accountancy", "Banking Sector", "Financial Analysis", "Business Management"],
                    "topRecruiters": ["Big 4 (Deloitte, PwC, EY, KPMG)", "Banks", "MNCs", "Financial Institutions"],
                    "futureOutlook": "Growing demand in fintech, digital banking, and financial consulting"
                }
            },
            {
                "nodeId": "10th-puc-arts",
                "label": "PUC Arts/Humanities",
                "category": "stream",
                "description": "Pre-University Course in Arts with History, Political Science, Sociology, Psychology, and Languages",
                "duration": "2 years",
                "eligibility": "Pass 10th Standard",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "2-4 LPA", "mid": "5-10 LPA", "senior": "10-20 LPA"},
                    "growthRate": 68,
                    "skills": ["Communication", "Critical Thinking", "Research", "Social Awareness"],
                    "educationPath": ["Complete 10th", "Join PUC Arts", "Pursue BA/BSc", "Prepare for Civil Services"],
                    "growthOpportunities": ["Civil Services (IAS/IPS)", "Teaching", "Journalism", "Social Work", "Psychology"],
                    "topRecruiters": ["Government Services", "Educational Institutions", "Media Houses", "NGOs"],
                    "futureOutlook": "Strong demand in public administration, media, and counseling services"
                }
            },
            {
                "nodeId": "10th-iti-electrician",
                "label": "ITI Electrician",
                "category": "certification",
                "description": "Industrial Training Institute course in Electrician trade with practical hands-on training",
                "duration": "2 years",
                "eligibility": "Pass 10th Standard with Science and Mathematics",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "2-3 LPA", "mid": "4-7 LPA", "senior": "8-12 LPA"},
                    "growthRate": 75,
                    "skills": ["Electrical Wiring", "Circuit Design", "Safety Protocols", "Equipment Maintenance"],
                    "educationPath": ["Complete 10th", "Join ITI Electrician", "Get certified", "Gain practical experience"],
                    "growthOpportunities": ["Government Jobs (Railways/Defense)", "Private Electrical Companies", "Self-Employment", "Supervisor Roles"],
                    "topRecruiters": ["Indian Railways", "BSNL", "State Electricity Boards", "L&T", "Siemens"],
                    "futureOutlook": "Consistent demand in infrastructure, renewable energy, and automation sectors"
                }
            },
            {
                "nodeId": "10th-iti-fitter",
                "label": "ITI Fitter",
                "category": "certification",
                "description": "Industrial Training in Fitter trade focusing on assembly, maintenance, and repair of mechanical equipment",
                "duration": "2 years",
                "eligibility": "Pass 10th Standard",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "2-3 LPA", "mid": "4-6 LPA", "senior": "7-10 LPA"},
                    "growthRate": 72,
                    "skills": ["Mechanical Assembly", "Machine Operation", "Blueprint Reading", "Quality Control"],
                    "educationPath": ["Complete 10th", "Join ITI Fitter", "Apprenticeship", "Specialize in CNC/Manufacturing"],
                    "growthOpportunities": ["Manufacturing Sector", "Automobile Industry", "Government PSUs", "Entrepreneurship"],
                    "topRecruiters": ["TATA Motors", "BHEL", "Mahindra", "Maruti Suzuki", "Defense Sector"],
                    "futureOutlook": "Growing opportunities in manufacturing, automation, and precision engineering"
                }
            },
            {
                "nodeId": "10th-diploma-engineering",
                "label": "Diploma in Engineering (Polytechnic)",
                "category": "degree",
                "description": "3-year diploma program in various engineering branches like Mechanical, Civil, Computer Science, Electronics",
                "duration": "3 years",
                "eligibility": "Pass 10th Standard with minimum 50% marks",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-5 LPA", "mid": "6-10 LPA", "senior": "12-18 LPA"},
                    "growthRate": 80,
                    "skills": ["Technical Knowledge", "Practical Skills", "Design Software", "Project Management"],
                    "educationPath": ["Complete 10th", "Enter Diploma Entrance Exam", "Join Polytechnic", "Lateral Entry to B.Tech (optional)"],
                    "growthOpportunities": ["Lateral Entry to Engineering", "Government Jobs", "Private Sector", "Higher Studies"],
                    "topRecruiters": ["Construction Companies", "IT Firms", "Manufacturing", "Government Departments"],
                    "futureOutlook": "Strong demand in infrastructure, IT, and manufacturing with option for further studies"
                }
            },
            {
                "nodeId": "10th-diploma-pharmacy",
                "label": "Diploma in Pharmacy (D.Pharm)",
                "category": "degree",
                "description": "2-year diploma program in pharmacy covering drug manufacturing, dispensing, and healthcare",
                "duration": "2 years",
                "eligibility": "Pass 10th with Science (Physics, Chemistry, Biology/Mathematics)",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "2-4 LPA", "mid": "5-8 LPA", "senior": "10-15 LPA"},
                    "growthRate": 76,
                    "skills": ["Pharmaceutical Knowledge", "Drug Dispensing", "Healthcare Management", "Quality Control"],
                    "educationPath": ["Complete 10th Science", "Join D.Pharm", "Register as Pharmacist", "Start Practice or Job"],
                    "growthOpportunities": ["Retail Pharmacy", "Hospital Pharmacy", "Pharmaceutical Companies", "Higher Studies (B.Pharm)"],
                    "topRecruiters": ["Apollo Pharmacy", "MedPlus", "Hospitals", "Pharma Companies (Sun Pharma, Cipla)"],
                    "futureOutlook": "Stable career with growing healthcare sector and pharmaceutical industry expansion"
                }
            },
            {
                "nodeId": "10th-vocational-courses",
                "label": "Vocational Courses (NSQF)",
                "category": "certification",
                "description": "Skill-based vocational training under National Skills Qualification Framework in various trades",
                "duration": "6 months - 2 years",
                "eligibility": "Pass 10th Standard",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "1.5-3 LPA", "mid": "3-6 LPA", "senior": "6-10 LPA"},
                    "growthRate": 70,
                    "skills": ["Trade-Specific Skills", "Practical Training", "Entrepreneurship", "Digital Literacy"],
                    "educationPath": ["Complete 10th", "Choose Vocational Trade", "Complete Training", "Get Certified"],
                    "growthOpportunities": ["Self-Employment", "Small Business", "Skilled Worker", "Supervisor"],
                    "topRecruiters": ["Small Industries", "Workshops", "Service Centers", "Own Business"],
                    "futureOutlook": "Government push for skill development creates opportunities in various sectors"
                }
            }
        ]
    
    def _get_12th_paths(self) -> List[Dict]:
        """Career paths after 12th standard"""
        return [
            {
                "nodeId": "12th-engineering-jee",
                "label": "B.E./B.Tech (Engineering via JEE)",
                "category": "degree",
                "description": "Bachelor of Engineering/Technology through JEE Main/Advanced entrance examination",
                "duration": "4 years",
                "eligibility": "12th with PCM (Physics, Chemistry, Mathematics) minimum 75%",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "5-10 LPA", "mid": "12-25 LPA", "senior": "25-50 LPA"},
                    "growthRate": 90,
                    "skills": ["Programming", "Mathematics", "Problem Solving", "Logical Reasoning", "Technical Skills"],
                    "educationPath": ["Complete 12th PCM", "Prepare for JEE Main/Advanced", "Clear Entrance Exam", "Join IIT/NIT/Private College"],
                    "growthOpportunities": ["Software Development", "Core Engineering", "Higher Studies (M.Tech/MS)", "Entrepreneurship", "Research"],
                    "topRecruiters": ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Reliance", "TATA"],
                    "governmentExams": ["GATE", "IES", "PSU Exams"],
                    "futureOutlook": "Excellent prospects in AI, Machine Learning, Data Science, Cybersecurity, and emerging technologies"
                }
            },
            {
                "nodeId": "12th-medical-neet",
                "label": "MBBS/BDS (Medical via NEET)",
                "category": "degree",
                "description": "Bachelor of Medicine and Bachelor of Surgery or Dental Surgery through NEET examination",
                "duration": "5.5 years (including internship)",
                "eligibility": "12th with PCB (Physics, Chemistry, Biology) minimum 50-60%",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "6-10 LPA", "mid": "15-30 LPA", "senior": "30-80 LPA"},
                    "growthRate": 92,
                    "skills": ["Biology", "Anatomy", "Patient Care", "Diagnosis", "Communication", "Empathy"],
                    "educationPath": ["Complete 12th PCB", "Prepare for NEET", "Clear NEET with good rank", "Join Medical College", "Complete Internship"],
                    "growthOpportunities": ["Medical Specialization (MD/MS)", "Private Practice", "Government Service", "Research", "Teaching"],
                    "topRecruiters": ["Government Hospitals", "Private Hospitals (Apollo, Fortis, Max)", "Clinics", "Medical Colleges"],
                    "governmentExams": ["NEET PG", "AIIMS Entrance", "JIPMER"],
                    "futureOutlook": "Perennial demand with opportunities in super-specialization, healthcare management, and medical research"
                }
            },
            {
                "nodeId": "12th-bca-computer",
                "label": "BCA (Bachelor of Computer Applications)",
                "category": "degree",
                "description": "3-year undergraduate program focused on computer applications, programming, and IT",
                "duration": "3 years",
                "eligibility": "12th in any stream with Mathematics/Computer Science (varies by college)",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-6 LPA", "mid": "8-15 LPA", "senior": "18-30 LPA"},
                    "growthRate": 85,
                    "skills": ["Programming (Java, Python, C++)", "Database Management", "Web Development", "Software Engineering"],
                    "educationPath": ["Complete 12th", "Join BCA Program", "Learn Programming Languages", "Do Internships", "Pursue MCA (optional)"],
                    "growthOpportunities": ["Software Developer", "Web Developer", "System Analyst", "Data Analyst", "MCA for Higher Studies"],
                    "topRecruiters": ["IT Companies (TCS, Infosys, Wipro)", "Startups", "MNCs", "Banks"],
                    "futureOutlook": "High demand in IT sector with opportunities in full-stack development, cloud computing, and cybersecurity"
                }
            },
            {
                "nodeId": "12th-bcom-commerce",
                "label": "B.Com (Bachelor of Commerce)",
                "category": "degree",
                "description": "3-year undergraduate program in Commerce, Accounting, Finance, and Business",
                "duration": "3 years",
                "eligibility": "12th in Commerce stream",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-5 LPA", "mid": "6-12 LPA", "senior": "15-30 LPA"},
                    "growthRate": 78,
                    "skills": ["Accounting", "Financial Management", "Taxation", "Business Law", "Auditing"],
                    "educationPath": ["Complete 12th Commerce", "Join B.Com", "Pursue CA/CS/CMA alongside", "Complete Articleship"],
                    "growthOpportunities": ["Chartered Accountancy", "Company Secretary", "Banking", "Financial Analysis", "Business Ownership"],
                    "topRecruiters": ["Big 4 Audit Firms", "Banks", "Financial Institutions", "Corporate Companies"],
                    "governmentExams": ["CA Foundation", "CS Executive", "Bank PO Exams"],
                    "futureOutlook": "Strong demand in accounting, finance, taxation with digital transformation creating new opportunities"
                }
            },
            {
                "nodeId": "12th-ba-arts",
                "label": "BA (Bachelor of Arts)",
                "category": "degree",
                "description": "3-year undergraduate program in Arts, Humanities, and Social Sciences",
                "duration": "3 years",
                "eligibility": "12th in any stream",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "2-4 LPA", "mid": "5-10 LPA", "senior": "10-25 LPA"},
                    "growthRate": 70,
                    "skills": ["Communication", "Critical Thinking", "Research", "Writing", "Social Analysis"],
                    "educationPath": ["Complete 12th", "Join BA Program", "Choose Specialization", "Prepare for Competitive Exams"],
                    "growthOpportunities": ["Civil Services", "Teaching (B.Ed + NET)", "Journalism", "Content Writing", "Social Work"],
                    "topRecruiters": ["Government Services", "Educational Institutions", "Media Houses", "Publishing"],
                    "governmentExams": ["UPSC Civil Services", "State PSC", "CTET", "NET"],
                    "futureOutlook": "Diverse opportunities in public service, education, media, and emerging fields like digital content"
                }
            },
            {
                "nodeId": "12th-bsc-science",
                "label": "B.Sc (Bachelor of Science)",
                "category": "degree",
                "description": "3-year undergraduate program in pure sciences - Physics, Chemistry, Mathematics, Biology",
                "duration": "3 years",
                "eligibility": "12th with Science (PCM/PCB)",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "2.5-5 LPA", "mid": "6-12 LPA", "senior": "12-25 LPA"},
                    "growthRate": 72,
                    "skills": ["Scientific Research", "Data Analysis", "Laboratory Techniques", "Critical Thinking"],
                    "educationPath": ["Complete 12th Science", "Join B.Sc", "Pursue M.Sc", "Clear entrance exams for research"],
                    "growthOpportunities": ["Research & Development", "Teaching", "Laboratory Work", "Data Science", "Higher Studies"],
                    "topRecruiters": ["Research Labs", "Educational Institutions", "Pharmaceutical Companies", "IT Sector"],
                    "governmentExams": ["IIT JAM", "GATE", "CSIR NET"],
                    "futureOutlook": "Growing opportunities in research, data science, and interdisciplinary fields"
                }
            },
            {
                "nodeId": "12th-bba-management",
                "label": "BBA (Bachelor of Business Administration)",
                "category": "degree",
                "description": "3-year undergraduate program in Business Administration and Management",
                "duration": "3 years",
                "eligibility": "12th in any stream",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-6 LPA", "mid": "8-15 LPA", "senior": "18-35 LPA"},
                    "growthRate": 82,
                    "skills": ["Leadership", "Communication", "Business Strategy", "Marketing", "Financial Management"],
                    "educationPath": ["Complete 12th", "Join BBA", "Do Internships", "Pursue MBA"],
                    "growthOpportunities": ["Business Management", "Marketing", "Human Resources", "Entrepreneurship", "MBA"],
                    "topRecruiters": ["MNCs", "Consulting Firms", "Banks", "Startups", "Corporate Houses"],
                    "futureOutlook": "Excellent growth with MBA and experience in management consulting and leadership roles"
                }
            },
            {
                "nodeId": "12th-hotel-management",
                "label": "Hotel Management & Catering Technology",
                "category": "degree",
                "description": "Bachelor's degree in Hospitality, Hotel Management, and Culinary Arts",
                "duration": "3-4 years",
                "eligibility": "12th in any stream",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "3-5 LPA", "mid": "6-12 LPA", "senior": "15-30 LPA"},
                    "growthRate": 75,
                    "skills": ["Culinary Arts", "Customer Service", "Hotel Operations", "Event Management", "Communication"],
                    "educationPath": ["Complete 12th", "Clear NCHMCT JEE", "Join IHM", "Complete Industrial Training"],
                    "growthOpportunities": ["Hotel Management", "Chef/Culinary Expert", "Event Management", "Cruise Lines", "International Opportunities"],
                    "topRecruiters": ["Taj Group", "Oberoi", "ITC Hotels", "Marriott", "International Chains"],
                    "futureOutlook": "Growing hospitality industry with excellent international career opportunities"
                }
            }
        ]
    
    def _get_diploma_paths(self) -> List[Dict]:
        """Career paths after Diploma"""
        return [
            {
                "nodeId": "diploma-lateral-btech",
                "label": "Lateral Entry to B.Tech (2nd Year)",
                "category": "degree",
                "description": "Direct admission to second year of B.Tech Engineering program after completing diploma",
                "duration": "3 years",
                "eligibility": "Diploma in Engineering with minimum 60% marks",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "5-8 LPA", "mid": "12-20 LPA", "senior": "25-45 LPA"},
                    "growthRate": 88,
                    "skills": ["Advanced Engineering", "Design & Analysis", "Project Management", "Technical Leadership"],
                    "educationPath": ["Complete Diploma", "Clear Lateral Entry Exam", "Join B.Tech 2nd Year", "Complete Degree"],
                    "growthOpportunities": ["Core Engineering", "Software Development", "Higher Studies (M.Tech)", "Management Roles"],
                    "topRecruiters": ["Engineering Companies", "IT Firms", "Manufacturing", "PSUs"],
                    "futureOutlook": "Full engineering degree opens doors to premium opportunities and higher studies"
                }
            },
            {
                "nodeId": "diploma-government-jobs",
                "label": "Government Jobs (Junior Engineer)",
                "category": "job",
                "description": "Direct entry to government sector as Junior Engineer in various departments",
                "duration": "Immediate employment",
                "eligibility": "Diploma in Engineering",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "4-6 LPA", "mid": "7-12 LPA", "senior": "12-20 LPA"},
                    "growthRate": 80,
                    "skills": ["Technical Knowledge", "Project Execution", "Team Management", "Government Procedures"],
                    "educationPath": ["Complete Diploma", "Apply for Government Exams", "Clear JE Exam", "Join Service"],
                    "growthOpportunities": ["Assistant Engineer", "Executive Engineer", "Superintending Engineer", "Chief Engineer"],
                    "topRecruiters": ["Indian Railways", "PWD", "BSNL", "State Electricity Boards", "Municipal Corporations"],
                    "governmentExams": ["SSC JE", "RRB JE", "State PSC JE Exams"],
                    "futureOutlook": "Job security with steady growth and pension benefits in government sector"
                }
            },
            {
                "nodeId": "diploma-private-jobs",
                "label": "Private Sector Jobs (Technician/Supervisor)",
                "category": "job",
                "description": "Employment in private companies as technician, supervisor, or junior engineer",
                "duration": "Immediate employment",
                "eligibility": "Diploma in relevant field",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "3-5 LPA", "mid": "6-10 LPA", "senior": "12-18 LPA"},
                    "growthRate": 75,
                    "skills": ["Technical Skills", "Quality Control", "Team Supervision", "Problem Solving"],
                    "educationPath": ["Complete Diploma", "Apply to Companies", "Clear Technical Interview", "Join Organization"],
                    "growthOpportunities": ["Senior Technician", "Supervisor", "Assistant Manager", "Department Head"],
                    "topRecruiters": ["Manufacturing Companies", "Construction Firms", "IT Companies", "Automobile Sector"],
                    "futureOutlook": "Good growth with experience and additional certifications"
                }
            },
            {
                "nodeId": "diploma-entrepreneurship",
                "label": "Start Own Business/Entrepreneurship",
                "category": "career",
                "description": "Start your own technical service business, workshop, or contracting firm",
                "duration": "Flexible",
                "eligibility": "Diploma + Business Skills",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "Variable", "mid": "5-15 LPA", "senior": "15-50+ LPA"},
                    "growthRate": 70,
                    "skills": ["Technical Expertise", "Business Management", "Marketing", "Customer Relations", "Financial Planning"],
                    "educationPath": ["Complete Diploma", "Gain Industry Experience", "Develop Business Plan", "Start Business"],
                    "growthOpportunities": ["Expand Business", "Hire Team", "Multiple Locations", "Franchise Model"],
                    "topRecruiters": ["Self-Employed", "Government Contracts", "Private Clients"],
                    "futureOutlook": "Unlimited growth potential with right skills, network, and business acumen"
                }
            }
        ]
    
    def _get_degree_paths(self) -> List[Dict]:
        """Career paths after Degree"""
        return [
            {
                "nodeId": "degree-mtech-gate",
                "label": "M.Tech (via GATE)",
                "category": "degree",
                "description": "Master of Technology with specialization through GATE examination",
                "duration": "2 years",
                "eligibility": "B.Tech/B.E. with valid GATE score",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "8-15 LPA", "mid": "18-30 LPA", "senior": "35-60 LPA"},
                    "growthRate": 90,
                    "skills": ["Advanced Specialization", "Research Methodology", "Innovation", "Technical Leadership"],
                    "educationPath": ["Complete B.Tech", "Prepare for GATE", "Clear GATE with good score", "Join IIT/NIT via GATE counseling"],
                    "growthOpportunities": ["R&D Roles", "Teaching (Professor)", "Senior Engineering Positions", "Ph.D."],
                    "topRecruiters": ["ISRO", "DRDO", "BARC", "IITs", "Research Labs", "MNCs"],
                    "governmentExams": ["GATE", "TANCET", "BITS HD"],
                    "futureOutlook": "Excellent for research careers, teaching, and specialized technical roles"
                }
            },
            {
                "nodeId": "degree-mba-cat",
                "label": "MBA (via CAT/XAT)",
                "category": "degree",
                "description": "Master of Business Administration through CAT, XAT, or other management entrance exams",
                "duration": "2 years",
                "eligibility": "Bachelor's degree in any field with minimum 50-60%",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "10-20 LPA", "mid": "25-50 LPA", "senior": "50-100+ LPA"},
                    "growthRate": 92,
                    "skills": ["Leadership", "Strategic Thinking", "Financial Acumen", "Team Management", "Decision Making"],
                    "educationPath": ["Complete Degree", "Prepare for CAT/XAT", "Clear Entrance + GD/PI", "Join B-School"],
                    "growthOpportunities": ["Management Consulting", "Investment Banking", "Product Management", "Entrepreneurship", "CXO Roles"],
                    "topRecruiters": ["McKinsey", "BCG", "Goldman Sachs", "Google", "Amazon", "Deloitte"],
                    "governmentExams": ["CAT", "XAT", "MAT", "CMAT", "GMAT"],
                    "futureOutlook": "Premium career path with exceptional growth in leadership and executive roles"
                }
            },
            {
                "nodeId": "degree-it-software-jobs",
                "label": "IT/Software Development Jobs",
                "category": "job",
                "description": "Start career as software developer, tester, or IT professional in tech companies",
                "duration": "Immediate employment",
                "eligibility": "Bachelor's degree (B.Tech/BCA/MCA/B.Sc CS)",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "4-8 LPA", "mid": "12-25 LPA", "senior": "25-50 LPA"},
                    "growthRate": 88,
                    "skills": ["Programming", "Data Structures", "System Design", "Communication", "Problem Solving"],
                    "educationPath": ["Complete Degree", "Learn Programming", "Build Projects", "Apply for Jobs/Campus Placement"],
                    "growthOpportunities": ["Senior Developer", "Tech Lead", "Architect", "Engineering Manager", "CTO"],
                    "topRecruiters": ["Google", "Microsoft", "Amazon", "TCS", "Infosys", "Wipro", "Startups"],
                    "futureOutlook": "Continuous growth with opportunities in AI, Cloud, Cybersecurity, and emerging technologies"
                }
            },
            {
                "nodeId": "degree-government-services",
                "label": "Government Services (UPSC/SSC/Banking)",
                "category": "certification",
                "description": "Competitive examinations for Administrative Services, Banking, and Public Sector",
                "duration": "1-2 years preparation",
                "eligibility": "Bachelor's degree in any discipline",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "6-10 LPA", "mid": "12-20 LPA", "senior": "20-35 LPA"},
                    "growthRate": 85,
                    "skills": ["General Knowledge", "Current Affairs", "Analytical Reasoning", "Essay Writing", "Interview Skills"],
                    "educationPath": ["Complete Degree", "Start Preparation", "Clear Prelims + Mains + Interview", "Join Service"],
                    "growthOpportunities": ["IAS/IPS/IFS", "Bank PO", "SSC CGL", "Public Sector Undertakings"],
                    "topRecruiters": ["Government of India", "State Governments", "Public Sector Banks", "PSUs"],
                    "governmentExams": ["UPSC Civil Services", "SSC CGL", "IBPS PO", "SBI PO", "GATE for PSUs"],
                    "futureOutlook": "Job security, social status, and opportunity to serve society with steady growth"
                }
            },
            {
                "nodeId": "degree-data-science",
                "label": "Data Science & Analytics",
                "category": "career",
                "description": "Specialized career in data analysis, machine learning, and business intelligence",
                "duration": "6-12 months upskilling",
                "eligibility": "Bachelor's degree with analytical mindset",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "6-12 LPA", "mid": "15-30 LPA", "senior": "30-60 LPA"},
                    "growthRate": 95,
                    "skills": ["Python/R", "Statistics", "Machine Learning", "SQL", "Data Visualization", "Business Acumen"],
                    "educationPath": ["Complete Degree", "Learn Python & Statistics", "Complete Data Science Course", "Build Portfolio"],
                    "growthOpportunities": ["Data Scientist", "ML Engineer", "Data Analyst", "Business Analyst", "AI Specialist"],
                    "topRecruiters": ["Amazon", "Flipkart", "Accenture", "Mu Sigma", "Fractal Analytics", "Startups"],
                    "futureOutlook": "One of the fastest-growing fields with massive demand across all industries"
                }
            },
            {
                "nodeId": "degree-civil-services",
                "label": "Civil Services (IAS/IPS/IFS)",
                "category": "career",
                "description": "India's premier administrative services through UPSC Civil Services Examination",
                "duration": "1-2 years dedicated preparation",
                "eligibility": "Bachelor's degree in any discipline",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "7-10 LPA", "mid": "15-25 LPA", "senior": "25-50 LPA"},
                    "growthRate": 90,
                    "skills": ["Leadership", "Decision Making", "Public Administration", "Communication", "Crisis Management"],
                    "educationPath": ["Complete Degree", "Start UPSC Preparation", "Clear Prelims", "Clear Mains", "Clear Interview"],
                    "growthOpportunities": ["District Collector", "Commissioner", "Secretary", "Chief Secretary", "Cabinet Secretary"],
                    "topRecruiters": ["Government of India", "State Administration"],
                    "governmentExams": ["UPSC Civil Services Examination"],
                    "futureOutlook": "Highest prestige and authority in public service with opportunity to impact millions"
                }
            }
        ]
    
    def _get_iti_paths(self) -> List[Dict]:
        """Career paths after ITI"""
        return [
            {
                "nodeId": "iti-apprenticeship",
                "label": "Apprenticeship Training",
                "category": "certification",
                "description": "On-the-job training under Apprentices Act in industries",
                "duration": "1-2 years",
                "eligibility": "ITI Certificate",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "1-2 LPA (stipend)", "mid": "3-5 LPA", "senior": "6-10 LPA"},
                    "growthRate": 72,
                    "skills": ["Practical Experience", "Industry Knowledge", "Safety Standards", "Technical Skills"],
                    "educationPath": ["Complete ITI", "Register on apprenticeshipindia.gov.in", "Get placed in industry", "Complete training"],
                    "growthOpportunities": ["Absorption in same company", "Better jobs with experience", "Supervisor roles"],
                    "topRecruiters": ["Indian Railways", "DRDO", "BHEL", "TATA", "L&T", "Automobile Companies"],
                    "futureOutlook": "Valuable industry experience leading to permanent employment"
                }
            },
            {
                "nodeId": "iti-technical-jobs",
                "label": "Technical Jobs (Technician)",
                "category": "job",
                "description": "Direct employment as technician in manufacturing, maintenance, or service sectors",
                "duration": "Immediate",
                "eligibility": "ITI Certificate in relevant trade",
                "demand": "high",
                "metadata": {
                    "averageSalary": {"entry": "2-3.5 LPA", "mid": "4-7 LPA", "senior": "8-12 LPA"},
                    "growthRate": 70,
                    "skills": ["Trade-specific skills", "Equipment Operation", "Maintenance", "Quality Check"],
                    "educationPath": ["Complete ITI", "Apply for jobs", "Clear skill test", "Join company"],
                    "growthOpportunities": ["Senior Technician", "Supervisor", "Assistant Engineer (with experience)", "Workshop Owner"],
                    "topRecruiters": ["Manufacturing Units", "Service Centers", "Workshops", "Government Departments"],
                    "futureOutlook": "Steady demand with skill upgrade opportunities"
                }
            }
        ]
    
    def _get_certificate_paths(self) -> List[Dict]:
        """Career paths after Certificate courses"""
        return [
            {
                "nodeId": "cert-freelancing",
                "label": "Freelancing/Self-Employment",
                "category": "career",
                "description": "Work independently offering services based on your skills",
                "duration": "Flexible",
                "eligibility": "Skill proficiency in any area",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "Variable", "mid": "3-10 LPA", "senior": "10-30+ LPA"},
                    "growthRate": 75,
                    "skills": ["Technical Skills", "Client Management", "Marketing", "Time Management"],
                    "educationPath": ["Develop Skills", "Create Portfolio", "Join Freelance Platforms", "Build Client Base"],
                    "growthOpportunities": ["Agency Owner", "Consultant", "Trainer", "Multiple Income Streams"],
                    "topRecruiters": ["Freelance Platforms (Upwork, Fiverr)", "Direct Clients"],
                    "futureOutlook": "Growing gig economy with unlimited earning potential"
                }
            },
            {
                "nodeId": "cert-further-education",
                "label": "Pursue Higher Education",
                "category": "education",
                "description": "Continue education with advanced diplomas or degrees",
                "duration": "1-3 years",
                "eligibility": "Certificate completion",
                "demand": "medium",
                "metadata": {
                    "averageSalary": {"entry": "Based on final qualification", "mid": "Based on final qualification", "senior": "Based on final qualification"},
                    "growthRate": 80,
                    "skills": ["Academic Foundation", "Subject Knowledge"],
                    "educationPath": ["Complete Certificate", "Apply for Advanced Programs", "Complete Higher Education"],
                    "growthOpportunities": ["Better Job Prospects", "Higher Salary", "Specialized Roles"],
                    "topRecruiters": ["Depends on final qualification"],
                    "futureOutlook": "Education always opens better opportunities"
                }
            }
        ]
    
    def get_paths_by_education(self, education_level: str) -> List[Dict]:
        """Get career paths for specific education level"""
        return self.career_paths.get(education_level, [])
    
    def get_node_expansion(self, node_id: str, education_level: str) -> List[Dict]:
        """Get child nodes for a specific parent node"""
        # This would normally query database
        # For now, return relevant paths based on category
        return []

# Initialize database
career_db = CareerDatabase()

# ==================== Analysis Engine ====================

class CareerAnalysisEngine:
    """Advanced career analysis and recommendation engine"""
    
    def __init__(self):
        self.db = career_db
    
    def analyze_career_paths(self, education_level: str, preferences: Dict = None) -> Dict:
        """Comprehensive career path analysis"""
        paths = self.db.get_paths_by_education(education_level)
        
        analysis = {
            "total_paths": len(paths),
            "categories": self._categorize_paths(paths),
            "demand_analysis": self._analyze_demand(paths),
            "salary_analysis": self._analyze_salary_ranges(paths),
            "skill_requirements": self._extract_skills(paths),
            "recommendations": self._generate_recommendations(paths, preferences)
        }
        
        return {
            "paths": paths,
            "analysis": analysis
        }
    
    def _categorize_paths(self, paths: List[Dict]) -> Dict:
        """Categorize paths by type"""
        categories = {}
        for path in paths:
            category = path['category']
            if category not in categories:
                categories[category] = []
            categories[category].append(path['label'])
        return categories
    
    def _analyze_demand(self, paths: List[Dict]) -> Dict:
        """Analyze demand distribution"""
        demand_counts = {"high": 0, "medium": 0, "low": 0}
        for path in paths:
            demand_counts[path['demand']] += 1
        
        return {
            "distribution": demand_counts,
            "high_demand_paths": [p['label'] for p in paths if p['demand'] == 'high']
        }
    
    def _analyze_salary_ranges(self, paths: List[Dict]) -> Dict:
        """Analyze salary trends"""
        return {
            "highest_entry": max([p['metadata']['averageSalary']['entry'] for p in paths]),
            "average_growth_rate": np.mean([p['metadata']['growthRate'] for p in paths])
        }
    
    def _extract_skills(self, paths: List[Dict]) -> List[str]:
        """Extract most demanded skills"""
        all_skills = []
        for path in paths:
            all_skills.extend(path['metadata']['skills'])
        
        # Return unique skills
        return list(set(all_skills))
    
    def _generate_recommendations(self, paths: List[Dict], preferences: Dict = None) -> List[Dict]:
        """Generate personalized recommendations"""
        if not preferences:
            # Return top paths by growth rate
            return sorted(paths, key=lambda x: x['metadata']['growthRate'], reverse=True)[:5]
        
        # Filter based on preferences
        recommended = []
        for path in paths:
            score = self._calculate_match_score(path, preferences)
            if score > 60:
                recommended.append({**path, "match_score": score})
        
        return sorted(recommended, key=lambda x: x['match_score'], reverse=True)[:5]
    
    def _calculate_match_score(self, path: Dict, preferences: Dict) -> int:
        """Calculate how well a path matches user preferences"""
        score = 50  # Base score
        
        # Demand preference
        if preferences.get('high_demand') and path['demand'] == 'high':
            score += 20
        
        # Salary preference
        if preferences.get('high_salary'):
            score += path['metadata']['growthRate'] // 5
        
        # Skills match
        if preferences.get('interests'):
            path_skills = path['metadata']['skills']
            common_skills = set(preferences['interests']) & set(path_skills)
            score += len(common_skills) * 5
        
        return min(score, 100)

# Initialize analysis engine
analysis_engine = CareerAnalysisEngine()

# ==================== API Endpoints ====================

@app.post("/api/generate-paths")
async def generate_career_paths(request: CareerPathRequest):
    """Generate career paths based on education level"""
    try:
        logger.info(f"Generating paths for education level: {request.educationLevel}")
        
        # Get paths from database
        paths = career_db.get_paths_by_education(request.educationLevel)
        
        if not paths:
            raise HTTPException(status_code=404, detail=f"No paths found for education level: {request.educationLevel}")
        
        # Analyze paths
        analysis = analysis_engine.analyze_career_paths(
            request.educationLevel, 
            request.preferences
        )
        
        logger.info(f"Successfully generated {len(paths)} career paths")
        
        return {
            "success": True,
            "data": {
                "nodes": paths,
                "analysis": analysis['analysis'],
                "timestamp": datetime.now().isoformat()
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating paths: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/expand-node/{node_id}")
async def expand_career_node(node_id: str, request: NodeExpandRequest):
    """Expand a career node to show detailed information and next steps"""
    try:
        logger.info(f"Expanding node: {node_id}")
        
        # Find the node in database
        node = None
        for education_level in career_db.career_paths.keys():
            for path in career_db.career_paths[education_level]:
                if path['nodeId'] == node_id:
                    node = path
                    break
            if node:
                break
        
        if not node:
            raise HTTPException(status_code=404, detail=f"Node not found: {node_id}")
        
        # Get child paths (next steps)
        children = []
        # Logic to find appropriate next steps would go here
        # For now, returning empty array
        
        logger.info(f"Successfully expanded node: {node_id}")
        
        return {
            "success": True,
            "data": {
                "children": children,
                "parentNode": node
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error expanding node: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/career-details/{node_id}")
async def get_career_details(node_id: str, language: str = "en"):
    """Get detailed information about a specific career path"""
    try:
        logger.info(f"Getting details for node: {node_id}")
        
        # Find the node
        node = None
        for education_level in career_db.career_paths.keys():
            for path in career_db.career_paths[education_level]:
                if path['nodeId'] == node_id:
                    node = path
                    break
            if node:
                break
        
        if not node:
            raise HTTPException(status_code=404, detail=f"Node not found: {node_id}")
        
        # Generate detailed information
        details = {
            "detailedDescription": f"{node['description']}. This is a comprehensive pathway that offers excellent opportunities for growth and development.",
            "educationPath": node['metadata']['educationPath'],
            "requiredSkills": node['metadata']['skills'][:5],
            "softSkills": ["Communication", "Problem Solving", "Teamwork", "Time Management", "Adaptability"],
            "technicalSkills": node['metadata']['skills'],
            "salaryRange": node['metadata']['averageSalary'],
            "growthOpportunities": node['metadata']['growthOpportunities'],
            "topRecruiters": node['metadata'].get('topRecruiters', []),
            "workEnvironment": "Professional work environment with opportunities for collaboration and innovation",
            "futureOutlook": node['metadata'].get('futureOutlook', "Positive growth trajectory"),
            "relatedCareers": [],
            "recommendedCourses": [],
            "governmentExams": node['metadata'].get('governmentExams', [])
        }
        
        logger.info(f"Successfully retrieved details for: {node_id}")
        
        return {
            "success": True,
            "data": {
                "details": details,
                "node": node
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting career details: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "AI Career Guidance LLM Service",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat()
    }

# ==================== Main Entry Point ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "llm_career_service:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
