#!/bin/bash
# ============================================
# Switch Database Configuration Script
# ============================================
#
# This script helps switch between PostgreSQL (Supabase) and Turso configurations.
#
# Usage:
#   ./scripts/switch-db.sh turso   # Switch to Turso
#   ./scripts/switch-db.sh pg      # Switch to PostgreSQL
#   ./scripts/switch-db.sh status  # Show current configuration
#
# ============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# File paths
SCHEMA_PG="$PROJECT_DIR/src/db/schema.ts"
SCHEMA_TURSO="$PROJECT_DIR/src/db/schema.turso.ts"
SCHEMA_ACTIVE="$PROJECT_DIR/src/db/schema.active.ts"

DB_SERVICE_PG="$PROJECT_DIR/src/lib/services/dbService.ts"
DB_SERVICE_TURSO="$PROJECT_DIR/src/lib/services/dbService.turso.ts"
DB_SERVICE_ACTIVE="$PROJECT_DIR/src/lib/services/dbService.active.ts"

DRIZZLE_CONFIG_PG="$PROJECT_DIR/drizzle.config.ts"
DRIZZLE_CONFIG_TURSO="$PROJECT_DIR/drizzle.config.turso.ts"
DRIZZLE_CONFIG_ACTIVE="$PROJECT_DIR/drizzle.config.active.ts"

SEED_DB_PG="$PROJECT_DIR/src/db/seeds/db.ts"
SEED_DB_TURSO="$PROJECT_DIR/src/db/seeds/db.turso.ts"
SEED_DB_ACTIVE="$PROJECT_DIR/src/db/seeds/db.active.ts"

show_status() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}Database Configuration Status${NC}"
    echo -e "${BLUE}============================================${NC}"
    
    # Check which schema is active by looking at imports
    if grep -q "pg-core" "$PROJECT_DIR/src/db/schema.ts" 2>/dev/null; then
        echo -e "Schema:        ${GREEN}PostgreSQL${NC}"
    elif grep -q "sqlite-core" "$PROJECT_DIR/src/db/schema.ts" 2>/dev/null; then
        echo -e "Schema:        ${YELLOW}Turso (SQLite)${NC}"
    else
        echo -e "Schema:        ${RED}Unknown${NC}"
    fi
    
    # Check drizzle config
    if grep -q '"postgresql"' "$PROJECT_DIR/drizzle.config.ts" 2>/dev/null; then
        echo -e "Drizzle:       ${GREEN}PostgreSQL${NC}"
    elif grep -q '"turso"' "$PROJECT_DIR/drizzle.config.ts" 2>/dev/null; then
        echo -e "Drizzle:       ${YELLOW}Turso${NC}"
    else
        echo -e "Drizzle:       ${RED}Unknown${NC}"
    fi
    
    # Check environment variables
    if [ -n "$TURSO_DATABASE_URL" ]; then
        echo -e "TURSO_URL:     ${GREEN}Set${NC}"
    else
        echo -e "TURSO_URL:     ${RED}Not set${NC}"
    fi
    
    if [ -n "$DATABASE_URL" ]; then
        echo -e "DATABASE_URL:  ${GREEN}Set${NC}"
    else
        echo -e "DATABASE_URL:  ${RED}Not set${NC}"
    fi
    
    echo ""
}

switch_to_turso() {
    echo -e "${YELLOW}Switching to Turso configuration...${NC}"
    
    # Backup current files
    echo "📦 Backing up current configuration..."
    [ -f "$SCHEMA_PG" ] && cp "$SCHEMA_PG" "$SCHEMA_ACTIVE.pg.bak" 2>/dev/null || true
    [ -f "$DB_SERVICE_PG" ] && cp "$DB_SERVICE_PG" "$DB_SERVICE_ACTIVE.pg.bak" 2>/dev/null || true
    [ -f "$DRIZZLE_CONFIG_PG" ] && cp "$DRIZZLE_CONFIG_PG" "$DRIZZLE_CONFIG_ACTIVE.pg.bak" 2>/dev/null || true
    [ -f "$SEED_DB_PG" ] && cp "$SEED_DB_PG" "$SEED_DB_ACTIVE.pg.bak" 2>/dev/null || true
    
    # Copy Turso files to active locations
    echo "📝 Activating Turso configuration..."
    
    if [ -f "$SCHEMA_TURSO" ]; then
        cp "$SCHEMA_TURSO" "$SCHEMA_PG"
        echo "  ✅ Schema updated"
    else
        echo -e "  ${RED}❌ schema.turso.ts not found${NC}"
    fi
    
    if [ -f "$DB_SERVICE_TURSO" ]; then
        cp "$DB_SERVICE_TURSO" "$DB_SERVICE_PG"
        echo "  ✅ DbService updated"
    else
        echo -e "  ${RED}❌ dbService.turso.ts not found${NC}"
    fi
    
    if [ -f "$DRIZZLE_CONFIG_TURSO" ]; then
        cp "$DRIZZLE_CONFIG_TURSO" "$DRIZZLE_CONFIG_PG"
        echo "  ✅ Drizzle config updated"
    else
        echo -e "  ${RED}❌ drizzle.config.turso.ts not found${NC}"
    fi
    
    if [ -f "$SEED_DB_TURSO" ]; then
        cp "$SEED_DB_TURSO" "$SEED_DB_PG"
        echo "  ✅ Seed db updated"
    else
        echo -e "  ${RED}❌ db.turso.ts not found${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Switched to Turso configuration${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Ensure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env"
    echo "  2. Run: pnpm install (if @libsql/client is not installed)"
    echo "  3. Run: pnpm db:push (to create tables)"
    echo "  4. Run: pnpm db:seed (to seed data)"
    echo ""
}

switch_to_pg() {
    echo -e "${YELLOW}Switching to PostgreSQL configuration...${NC}"
    
    # Restore from backups if they exist
    echo "📝 Restoring PostgreSQL configuration..."
    
    if [ -f "$SCHEMA_ACTIVE.pg.bak" ]; then
        cp "$SCHEMA_ACTIVE.pg.bak" "$SCHEMA_PG"
        echo "  ✅ Schema restored"
    else
        echo -e "  ${YELLOW}⚠️  No backup found for schema${NC}"
    fi
    
    if [ -f "$DB_SERVICE_ACTIVE.pg.bak" ]; then
        cp "$DB_SERVICE_ACTIVE.pg.bak" "$DB_SERVICE_PG"
        echo "  ✅ DbService restored"
    else
        echo -e "  ${YELLOW}⚠️  No backup found for dbService${NC}"
    fi
    
    if [ -f "$DRIZZLE_CONFIG_ACTIVE.pg.bak" ]; then
        cp "$DRIZZLE_CONFIG_ACTIVE.pg.bak" "$DRIZZLE_CONFIG_PG"
        echo "  ✅ Drizzle config restored"
    else
        echo -e "  ${YELLOW}⚠️  No backup found for drizzle config${NC}"
    fi
    
    if [ -f "$SEED_DB_ACTIVE.pg.bak" ]; then
        cp "$SEED_DB_ACTIVE.pg.bak" "$SEED_DB_PG"
        echo "  ✅ Seed db restored"
    else
        echo -e "  ${YELLOW}⚠️  No backup found for seed db${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Switched to PostgreSQL configuration${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Ensure DATABASE_URL is set in .env"
    echo "  2. Run: pnpm db:push (to sync schema)"
    echo ""
}

# Main script
case "${1:-status}" in
    turso)
        switch_to_turso
        ;;
    pg|postgres|postgresql)
        switch_to_pg
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 {turso|pg|status}"
        echo ""
        echo "Commands:"
        echo "  turso   - Switch to Turso (SQLite) configuration"
        echo "  pg      - Switch to PostgreSQL configuration"
        echo "  status  - Show current configuration"
        exit 1
        ;;
esac
