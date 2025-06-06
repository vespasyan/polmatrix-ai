import os

# Create necessary directories
directories = [
    'etl_logs',
    'data_cache',
    'extract',
    'transform',
    'load',
    'orchestrator',
    'tests'
]

# Create directories
for directory in directories:
    os.makedirs(directory, exist_ok=True)
    print(f"Created directory: {directory}")

# Create __init__.py files in each module directory
module_dirs = ['extract', 'transform', 'load', 'orchestrator', 'tests']
for directory in module_dirs:
    init_file = os.path.join(directory, '__init__.py')
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            pass  # Create empty file
        print(f"Created {init_file}")

print("Setup completed! All directories and __init__.py files have been created.")