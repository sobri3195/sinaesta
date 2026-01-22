#!/bin/bash

echo "🔍 Verifying Sinaesta Backend Setup..."
echo ""

# Check if all required files exist
echo "📁 Checking files..."

files=(
  "server/config/database.ts"
  "server/middleware/auth.ts"
  "server/migrations/001_initial_schema.sql"
  "server/migrations/seed.sql"
  "server/routes/auth.ts"
  "server/routes/users.ts"
  "server/routes/exams.ts"
  "server/routes/flashcards.ts"
  "server/routes/osce.ts"
  "server/routes/results.ts"
  "server/validations/authValidation.ts"
  "server/validations/examValidation.ts"
  "server/services/authService.ts"
  "services/apiService.ts"
  "docker-compose.yml"
  "Dockerfile"
  ".env.example"
)

missing_files=0
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (MISSING)"
    missing_files=$((missing_files + 1))
  fi
done

echo ""

# Check dependencies
echo "📦 Checking dependencies..."

dependencies=(
  "pg"
  "bcryptjs"
  "jsonwebtoken"
  "zod"
  "express"
  "cors"
  "helmet"
)

missing_deps=0
for dep in "${dependencies[@]}"; do
  if grep -q "\"$dep\"" package.json; then
    echo "  ✅ $dep"
  else
    echo "  ❌ $dep (MISSING)"
    missing_deps=$((missing_deps + 1))
  fi
done

echo ""

# Check documentation
echo "📚 Checking documentation..."

docs=(
  "BACKEND_README.md"
  "BACKEND_QUICKSTART.md"
  "API_DOCUMENTATION.md"
  "BACKEND_IMPLEMENTATION_SUMMARY.md"
)

missing_docs=0
for doc in "${docs[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✅ $doc"
  else
    echo "  ❌ $doc (MISSING)"
    missing_docs=$((missing_docs + 1))
  fi
done

echo ""

# Summary
echo "📊 Summary:"
echo "   Files: $(( ${#files[@]} - missing_files ))/${#files[@]} present"
echo "   Dependencies: $(( ${#dependencies[@]} - missing_deps ))/${#dependencies[@]} installed"
echo "   Documentation: $(( ${#docs[@]} - missing_docs ))/${#docs[@]} present"
echo ""

if [ $missing_files -eq 0 ] && [ $missing_deps -eq 0 ] && [ $missing_docs -eq 0 ]; then
  echo "✅ All checks passed! Backend is ready to use."
  echo ""
  echo "🚀 Next steps:"
  echo "   1. Start PostgreSQL: docker-compose up -d postgres"
  echo "   2. Run setup: npm run db:setup"
  echo "   3. Start server: npm run dev:all"
  echo ""
  echo "📖 Read BACKEND_QUICKSTART.md for more details"
  exit 0
else
  echo "❌ Some checks failed. Please install missing components."
  exit 1
fi
