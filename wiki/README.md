# The Stack Hub Platform - Documentation Wiki

Welcome to the The Stack Hub Platform documentation. This wiki contains comprehensive documentation for the EdTech platform.

## 📚 Documentation Index

### Core Documentation

1. **[Business Requirements](./01-Business-Requirements.md)**
   - Complete business requirements
   - User roles and permissions
   - System flows and processes
   - Feature descriptions
   - Business rules and constraints

2. **[Database Schema](./03-Database.md)**
   - Database setup and management
   - Table structures and relationships
   - Question language system
   - API endpoints reference
   - Migration guides

3. **[Testing Guide](./04-Testing-Guide.md)**
   - End-to-end testing instructions
   - Test users and credentials
   - Test data overview
   - Question types testing
   - Exam flow testing
   - Common test cases
   - Troubleshooting guide

### Design & Development

4. **[Design System](./13-Design-System.md)**
   - Color palette and brand guidelines
   - Typography scale
   - Component patterns
   - Spacing and layout principles
   - Micro-interactions
   - Accessibility guidelines
   - Responsive breakpoints
   - Dark mode support

5. **[Hierarchical Subjects](./14-Hierarchical-Subjects.md)**
   - Category and sub-subject system
   - Database schema
   - API endpoints
   - UI/UX implementation
   - Seeding and data structure
   - Implementation details

6. **[Question Editor Integration](./15-Question-Editor-Integration.md)**
   - Integration summary
   - Files modified
   - State management changes
   - Backward compatibility
   - Database storage format

7. **[Question Editor Setup](./16-Question-Editor-Setup.md)**
   - Complete setup guide
   - Component documentation
   - Installation and dependencies
   - Usage examples
   - Image upload configuration
   - Math formulas
   - Tables
   - Keyboard shortcuts
   - Troubleshooting

8. **[UX Redesign Summary](./17-UX-Redesign-Summary.md)**
   - Dashboard redesign
   - Subjects page redesign
   - Questions page redesign
   - Navigation simplification
   - Design principles
   - Technical implementation

## 🎯 Quick Start

### For Developers

1. **Setup Project**
   ```bash
   npm run setup:full
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Browse Database**
   ```bash
   npm run db:studio
   ```

### For Business Stakeholders

- Read [Business Requirements](./01-Business-Requirements.md) for:
  - System overview
  - User workflows
  - Feature descriptions
  - Business rules

## 📖 Documentation Structure

```
wiki/
├── README.md                           # This file (documentation index)
├── 01-Business-Requirements.md        # Business requirements and flows
├── 03-Database.md                      # Database schema and API reference
├── 04-Testing-Guide.md                 # Comprehensive testing guide
├── 13-Design-System.md                 # Design system guidelines
├── 14-Hierarchical-Subjects.md         # Category and sub-subject system
├── 15-Question-Editor-Integration.md   # Question editor integration summary
├── 16-Question-Editor-Setup.md        # Question editor setup guide
└── 17-UX-Redesign-Summary.md          # UX/UI redesign summary
```

## 🔍 Key Topics

### Content Management
- Question creation and organization
- Bulk import (PDF/CSV with AI)
- Subject and chapter structure
- Multilingual support (English/Marathi)

### Exam System
- Exam structures (blueprints)
- Scheduled exams
- Student exam taking flow
- Scoring and evaluation

### User Management
- Role-based access (Admin, Teacher, Student)
- School management
- Class level organization

### Analytics
- Performance tracking
- Question effectiveness
- Class and subject analytics

## 🔗 Related Documentation

- **Component Documentation**: Inline code comments
- **API Reference**: See `03-Database.md` → Mobile App API Reference

## 📝 Documentation Updates

This documentation is maintained alongside the codebase. When making significant changes:

1. Update relevant wiki files
2. Update inline code comments
3. Update migration guides if schema changes
4. Update API documentation if endpoints change

---

*Last Updated: 2024*
