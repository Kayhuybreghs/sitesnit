"""Compatibility entry point: offline, staged generator. No child renderers or downloads."""
from pathlib import Path
import subprocess
import sys
root = Path(__file__).resolve().parents[1]
subprocess.run(['node', '--experimental-strip-types', '--import', './scripts/typescript-test-loader.mjs', 'scripts/prepare-social-images.mjs', *sys.argv[1:]], cwd=root, check=True)
