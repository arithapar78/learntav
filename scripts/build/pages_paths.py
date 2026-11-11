from lib import *
x = head('Learning Paths | LearnTAV','Where to start learning to build with AI. Begin with Vibe Coding 101, four live one-hour sessions.','education/paths/',2)
x += f'''
    <section class="page-header"><div class="container"><div class="page-header-content">
        <span class="section-tag">Learn</span>
        <h1 class="page-title">Learning paths</h1>
        <p class="page-description">Where to start, and what&rsquo;s next.</p>
    </div></div></section>

    <section class="section"><div class="container">
        <div class="grid-2">
            <div class="card reveal">
                <span class="pill pill-brand" style="margin-bottom: var(--space-4); display:inline-flex">Start here</span>
                <h2 class="h3">Beginner path: Vibe Coding 101</h2>
                <p>For anyone new to AI and app building. Four live one-hour sessions, ending in a hands-on project.</p>
                <ul class="tick-list" style="margin: var(--space-4) 0"><li>Group <span data-cfg="pricing.group.total">$99</span> or private <span data-cfg="pricing.private.total">$199</span> per person, full course</li><li>No coding experience required</li></ul>
                <a class="btn btn-cta" href="../vibe-coding-101/index.html">Course details {ICON['arrow']}</a>
            </div>
            <div class="card placeholder-card reveal">
                <h2 class="h3">What&rsquo;s next</h2>
                <p>Further programs aren&rsquo;t scheduled yet. If you finish Vibe Coding 101 and want to go deeper, or want a custom learning plan for a team, get in touch.</p>
                <a class="btn btn-outline" href="../../contact/index.html">Talk to us {ICON['arrow']}</a>
            </div>
        </div>
    </div></section>
'''
x += foot(2)
write('education/paths/index.html', x)
