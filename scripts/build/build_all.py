#!/usr/bin/env python3
"""Regenerates the generated pages. Run from anywhere:
    python3 scripts/build/build_all.py
Pages generated here: home, Vibe Coding 101, Education, Learning Paths,
Pricing, Enroll, Products, Trophy Case, Case Studies.
Other pages are plain hand-edited HTML."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import pages_home_course, pages_pricing_enroll, pages_education, pages_paths, pages_products, pages_legal
pages_products.trophy_case()
pages_products.products_index()
print('all pages built')
