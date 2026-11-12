"""
GoldWise — GitHub Remote Push Utility using Dulwich (Pure Python Git)
Enables pushing commits directly without needing Git binary installed.

Usage:
    python push_to_github.py <GITHUB_PERSONAL_ACCESS_TOKEN>
    or set environment variable GITHUB_TOKEN
"""
import os
import sys
from dulwich import porcelain
from dulwich.repo import Repo


def push_repo(token: str = None):
    token = token or os.environ.get("GITHUB_TOKEN")
    if not token and len(sys.argv) > 1:
        token = sys.argv[1].strip()

    if not token:
        print("Error: GitHub Personal Access Token is required to push to https://github.com/kavya598/Goldwise.git")
        print("\nQuick steps to generate a token:")
        print("1. Go to https://github.com/settings/tokens")
        print("2. Click 'Generate new token (classic)'")
        print("3. Check the 'repo' scope (full control of private repositories)")
        print("4. Copy the generated token (starts with ghp_...)")
        print("5. Run: python push_to_github.py <YOUR_TOKEN>")
        sys.exit(1)

    remote_url = f"https://kavya598:{token}@github.com/kavya598/Goldwise.git"
    repo = Repo('.')
    print("Pushing 'main' branch to https://github.com/kavya598/Goldwise.git ...")
    try:
        porcelain.push(repo, remote_url, 'refs/heads/main')
        print("Successfully pushed all code to https://github.com/kavya598/Goldwise.git!")
    except Exception as e:
        print(f"Push failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    push_repo()
