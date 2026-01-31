#!/bin/bash

set -e

# FieldDB CouchApp Deployment Script
# Usage: ./scripts/deploy_couchapp.sh [environment]
# Environment: localhost (default) or production

ENVIRONMENT=${1:-localhost}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
COUCHAPP_DIR="$PROJECT_ROOT/couchapp_prototype"

echo "======================================"
echo "FieldDB CouchApp Deployment"
echo "Environment: $ENVIRONMENT"
echo "======================================"

# Set CouchDB URL based on environment
if [ "$ENVIRONMENT" = "localhost" ]; then
    COUCHDB_URL="http://admin:none@localhost:5984"
    DB_NAME="prototypedev"
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "Error: Production deployment not yet configured"
    echo "Please configure production CouchDB URL in this script"
    exit 1
else
    echo "Error: Unknown environment '$ENVIRONMENT'"
    echo "Usage: $0 [localhost|production]"
    exit 1
fi

DESIGN_DOC_URL="$COUCHDB_URL/$DB_NAME/_design/prototype"

echo ""
echo "Step 1: Checking CouchDB connection..."
if ! curl -sf "$COUCHDB_URL/" > /dev/null; then
    echo "Error: Cannot connect to CouchDB at $COUCHDB_URL"
    echo "Please ensure CouchDB is running"
    exit 1
fi
echo "✓ CouchDB is accessible"

echo ""
echo "Step 2: Checking database exists..."
if ! curl -sf "$COUCHDB_URL/$DB_NAME" > /dev/null; then
    echo "Error: Database '$DB_NAME' does not exist"
    echo "Creating database..."
    curl -X PUT "$COUCHDB_URL/$DB_NAME"
    echo ""
fi
echo "✓ Database '$DB_NAME' exists"

echo ""
echo "Step 3: Building CouchApp document..."
cd "$COUCHAPP_DIR"

# Create temporary Python script for building the design document
cat > /tmp/build_couchapp.py << 'PYTHON_SCRIPT'
import json
import os
import base64
import sys

def build_design_doc(couchapp_dir, design_doc_url):
    # Read _id
    id_file = os.path.join(couchapp_dir, '_id')
    if not os.path.exists(id_file):
        print(f"Error: {id_file} not found")
        sys.exit(1)
    
    with open(id_file, 'r') as f:
        doc_id = f.read().strip()
    
    # Create design document structure
    doc = {
        '_id': doc_id,
        'language': 'javascript',
        '_attachments': {}
    }
    
    # Walk through _attachments directory
    attachments_dir = os.path.join(couchapp_dir, '_attachments')
    if not os.path.exists(attachments_dir):
        print(f"Error: {attachments_dir} not found")
        sys.exit(1)
    
    attachment_count = 0
    for root, dirs, files in os.walk(attachments_dir):
        for file in files:
            filepath = os.path.join(root, file)
            relpath = os.path.relpath(filepath, attachments_dir)
            
            # Read file as binary
            with open(filepath, 'rb') as f:
                content = f.read()
            
            # Determine content type
            content_type = 'application/octet-stream'
            ext = os.path.splitext(relpath)[1].lower()
            content_types = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.ico': 'image/x-icon',
                '.svg': 'image/svg+xml',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject'
            }
            content_type = content_types.get(ext, content_type)
            
            doc['_attachments'][relpath] = {
                'content_type': content_type,
                'data': base64.b64encode(content).decode('utf-8')
            }
            attachment_count += 1
    
    print(f"✓ Processed {attachment_count} attachments")
    
    # Get current revision if document exists
    import subprocess
    result = subprocess.run(
        ['curl', '-sf', design_doc_url],
        capture_output=True,
        text=True
    )
    
    if result.returncode == 0 and result.stdout:
        try:
            current_doc = json.loads(result.stdout)
            if '_rev' in current_doc:
                doc['_rev'] = current_doc['_rev']
                print(f"✓ Found existing revision: {doc['_rev']}")
        except json.JSONDecodeError:
            print("Note: No existing document found, creating new one")
    
    # Write to file
    output_file = '/tmp/couchapp_doc.json'
    with open(output_file, 'w') as f:
        json.dump(doc, f)
    
    print(f"✓ Created design document at {output_file}")
    return output_file

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 build_couchapp.py <couchapp_dir> <design_doc_url>")
        sys.exit(1)
    
    couchapp_dir = sys.argv[1]
    design_doc_url = sys.argv[2]
    build_design_doc(couchapp_dir, design_doc_url)
PYTHON_SCRIPT

python3 /tmp/build_couchapp.py "$COUCHAPP_DIR" "$DESIGN_DOC_URL"

echo ""
echo "Step 4: Uploading to CouchDB..."
UPLOAD_RESULT=$(curl -sf -X PUT "$DESIGN_DOC_URL" \
    -d @/tmp/couchapp_doc.json \
    -H "Content-Type: application/json" 2>&1)

if [ $? -eq 0 ]; then
    echo "$UPLOAD_RESULT" | python3 -m json.tool
    echo ""
    echo "✓ CouchApp deployed successfully!"
else
    echo "Error: Upload failed"
    echo "$UPLOAD_RESULT"
    exit 1
fi

# Cleanup
rm -f /tmp/build_couchapp.py /tmp/couchapp_doc.json

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo "Access your app at:"
if [ "$ENVIRONMENT" = "localhost" ]; then
    echo "  https://localhost:6984/$DB_NAME/_design/prototype/user.html"
fi
echo ""
