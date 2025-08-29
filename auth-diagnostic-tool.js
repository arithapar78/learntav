/**
 * LearnTAV Authentication Diagnostic Tool
 * Comprehensive logging to validate authentication issues
 */

(function() {
    'use strict';

    class AuthDiagnosticTool {
        constructor() {
            this.issues = [];
            this.warnings = [];
            this.diagnosticResults = {
                credentialMismatch: null,
                fragmentedAuth: null,
                sessionConflicts: null,
                userCreation: null
            };
        }

        async runFullDiagnostic() {
            console.log('🔍 ========== AUTHENTICATION DIAGNOSTIC TOOL ==========');
            console.log('📊 Running comprehensive authentication system analysis...');
            
            this.checkCredentialConsistency();
            this.checkAuthenticationSystems();
            this.checkSessionStorage();
            this.checkUserCreationFlow();
            this.testActualAuthentication();
            
            this.generateReport();
            return this.diagnosticResults;
        }

        checkCredentialConsistency() {
            console.log('\n🔐 === CREDENTIAL CONSISTENCY CHECK ===');
            
            const credentialSources = {
                testFile: {
                    source: 'test-auth.html',
                    credentials: {
                        username: 'LearnTAV',
                        password: 'learning_takes_a_village78',
                        code: '0410'
                    }
                },
                adminAuth: {
                    source: 'admin/admin-auth.js',
                    credentials: window.LearnTAVAdminAuth ? {
                        username: window.LearnTAVAdminAuth.adminCredentials?.username || 'NOT_FOUND',
                        password: window.LearnTAVAdminAuth.adminCredentials?.password || 'NOT_FOUND',
                        code: window.LearnTAVAdminAuth.adminCredentials?.code || 'NOT_FOUND'
                    } : { error: 'LearnTAVAdminAuth not loaded' }
                },
                debugReports: {
                    source: 'Debug reports',
                    credentials: {
                        email: 'admin@learntav.com',
                        password: 'AdminPass123!',
                        note: 'From ADMIN-AUTHENTICATION-DEBUG-REPORT.md'
                    }
                },
                devHelper: {
                    source: 'admin-dev-helper.js',
                    credentials: {
                        email: 'admin@learntav.com',  
                        password: 'AdminPass123!',
                        note: 'Console logging credentials'
                    }
                }
            };

            console.log('📋 FOUND CREDENTIAL SOURCES:');
            Object.entries(credentialSources).forEach(([key, source]) => {
                console.log(`\n  📁 ${source.source}:`);
                if (source.credentials.error) {
                    console.log(`    ❌ ERROR: ${source.credentials.error}`);
                } else {
                    Object.entries(source.credentials).forEach(([field, value]) => {
                        console.log(`    ${field}: ${value}`);
                    });
                }
            });

            // Analyze mismatches
            const uniquePasswords = new Set();
            const uniqueUsernames = new Set();
            
            Object.values(credentialSources).forEach(source => {
                if (!source.credentials.error) {
                    if (source.credentials.password) uniquePasswords.add(source.credentials.password);
                    if (source.credentials.username) uniqueUsernames.add(source.credentials.username);
                    if (source.credentials.email) uniqueUsernames.add(source.credentials.email);
                }
            });

            const credentialMismatch = uniquePasswords.size > 1 || uniqueUsernames.size > 1;
            
            console.log(`\n🎯 CREDENTIAL ANALYSIS:`);
            console.log(`   Unique Passwords Found: ${uniquePasswords.size}`);
            console.log(`   Unique Usernames Found: ${uniqueUsernames.size}`);
            console.log(`   MISMATCH DETECTED: ${credentialMismatch ? '❌ YES' : '✅ NO'}`);

            if (credentialMismatch) {
                this.issues.push('CRITICAL: Multiple conflicting credential sets found across the system');
                console.log(`   🚨 ISSUE: Users cannot know which credentials are valid!`);
            }

            this.diagnosticResults.credentialMismatch = {
                detected: credentialMismatch,
                sources: credentialSources,
                uniquePasswords: Array.from(uniquePasswords),
                uniqueUsernames: Array.from(uniqueUsernames)
            };
        }

        checkAuthenticationSystems() {
            console.log('\n🏗️ === AUTHENTICATION ARCHITECTURE CHECK ===');
            
            const authSystems = {
                LearnTAVAuth: {
                    loaded: !!window.LearnTAVAuth,
                    purpose: 'Main user authentication',
                    methods: window.LearnTAVAuth ? Object.getOwnPropertyNames(window.LearnTAVAuth) : []
                },
                LearnTAVAdminAuth: {
                    loaded: !!window.LearnTAVAdminAuth,
                    purpose: 'Admin-specific authentication',
                    methods: window.LearnTAVAdminAuth ? Object.getOwnPropertyNames(window.LearnTAVAdminAuth) : []
                },
                SessionSyncManager: {
                    loaded: !!window.SessionSyncManager,
                    purpose: 'Emergency session fixes',
                    methods: window.SessionSyncManager ? Object.getOwnPropertyNames(window.SessionSyncManager) : []
                },
                AdminAccessFix: {
                    loaded: !!window.AdminAccessFix,
                    purpose: 'Admin panel access patches',
                    methods: window.AdminAccessFix ? Object.getOwnPropertyNames(window.AdminAccessFix) : []
                }
            };

            console.log('📋 AUTHENTICATION SYSTEMS:');
            let loadedSystems = 0;
            Object.entries(authSystems).forEach(([name, system]) => {
                console.log(`\n  🔧 ${name}:`);
                console.log(`     Status: ${system.loaded ? '✅ LOADED' : '❌ NOT LOADED'}`);
                console.log(`     Purpose: ${system.purpose}`);
                if (system.loaded) {
                    loadedSystems++;
                    console.log(`     Methods: ${system.methods.length} available`);
                }
            });

            const fragmentedAuth = loadedSystems > 1;
            console.log(`\n🎯 ARCHITECTURE ANALYSIS:`);
            console.log(`   Loaded Systems: ${loadedSystems}`);
            console.log(`   FRAGMENTATION DETECTED: ${fragmentedAuth ? '❌ YES' : '✅ NO'}`);

            if (fragmentedAuth) {
                this.issues.push('CRITICAL: Multiple independent authentication systems operating simultaneously');
                console.log(`   🚨 ISSUE: Systems don't communicate, causing session conflicts!`);
            }

            this.diagnosticResults.fragmentedAuth = {
                detected: fragmentedAuth,
                systems: authSystems,
                loadedCount: loadedSystems
            };
        }

        checkSessionStorage() {
            console.log('\n💾 === SESSION STORAGE CHECK ===');
            
            const sessionKeys = [
                'learntav_session',
                'learntav_session_persistent', 
                'learntav_remember',
                'admin_auth_session',
                'learntav_users'
            ];

            const storageState = {
                sessionStorage: {},
                localStorage: {}
            };

            console.log('📋 CURRENT STORAGE STATE:');
            
            sessionKeys.forEach(key => {
                const sessionValue = sessionStorage.getItem(key);
                const localValue = localStorage.getItem(key);
                
                storageState.sessionStorage[key] = sessionValue ? 'EXISTS' : 'EMPTY';
                storageState.localStorage[key] = localValue ? 'EXISTS' : 'EMPTY';
                
                console.log(`\n  🔑 ${key}:`);
                console.log(`     Session Storage: ${sessionValue ? '✅ EXISTS' : '❌ EMPTY'}`);
                console.log(`     Local Storage: ${localValue ? '✅ EXISTS' : '❌ EMPTY'}`);
                
                if (sessionValue || localValue) {
                    try {
                        const parsed = JSON.parse(sessionValue || localValue);
                        if (parsed.user) {
                            console.log(`     Contains User: ${parsed.user.email || parsed.user.username || 'Unknown'}`);
                            console.log(`     Expires: ${parsed.expires ? new Date(parsed.expires).toISOString() : 'No expiration'}`);
                        }
                    } catch (error) {
                        console.log(`     ⚠️ Parse Error: ${error.message}`);
                    }
                }
            });

            // Check for conflicts
            const hasMultipleSessions = (storageState.localStorage.learntav_session_persistent === 'EXISTS' && 
                                       storageState.localStorage.admin_auth_session === 'EXISTS');

            if (hasMultipleSessions) {
                this.issues.push('WARNING: Multiple session types exist simultaneously');
                console.log(`\n   ⚠️ ISSUE: Multiple session types may cause conflicts`);
            }

            this.diagnosticResults.sessionConflicts = {
                detected: hasMultipleSessions,
                storageState: storageState
            };
        }

        checkUserCreationFlow() {
            console.log('\n👤 === USER CREATION FLOW CHECK ===');
            
            const users = localStorage.getItem('learntav_users');
            let userCount = 0;
            let adminCount = 0;
            
            if (users) {
                try {
                    const parsedUsers = JSON.parse(users);
                    userCount = parsedUsers.length;
                    adminCount = parsedUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
                    
                    console.log(`📊 USER DATABASE STATUS:`);
                    console.log(`   Total Users: ${userCount}`);
                    console.log(`   Admin Users: ${adminCount}`);
                    
                    if (adminCount === 0) {
                        this.issues.push('CRITICAL: No admin users exist in the database');
                        console.log(`   🚨 ISSUE: No admin accounts available for login!`);
                    }
                    
                    parsedUsers.forEach((user, index) => {
                        console.log(`\n   👤 User ${index + 1}:`);
                        console.log(`      Email: ${user.email}`);
                        console.log(`      Role: ${user.role}`);
                        console.log(`      Created: ${new Date(user.created).toISOString()}`);
                        console.log(`      Has Password Hash: ${!!user.passwordHash}`);
                    });
                    
                } catch (error) {
                    console.log(`❌ Error parsing user data: ${error.message}`);
                    this.issues.push('ERROR: User database is corrupted');
                }
            } else {
                console.log(`📊 USER DATABASE STATUS: ❌ EMPTY`);
                this.issues.push('CRITICAL: User database is completely empty');
                console.log(`   🚨 ISSUE: No user accounts exist for authentication!`);
            }

            this.diagnosticResults.userCreation = {
                detected: userCount === 0 || adminCount === 0,
                userCount: userCount,
                adminCount: adminCount
            };
        }

        async testActualAuthentication() {
            console.log('\n🧪 === LIVE AUTHENTICATION TEST ===');
            
            const testCredentials = [
                { source: 'Debug Reports', email: 'admin@learntav.com', password: 'AdminPass123!' },
                { source: 'Dev Helper', email: 'admin@learntav.com', password: 'AdminPass123!' },
                { source: 'Test User', email: 'test@learntav.com', password: 'TestPass123!' }
            ];

            for (const creds of testCredentials) {
                console.log(`\n🔐 Testing ${creds.source} credentials...`);
                console.log(`   Email: ${creds.email}`);
                console.log(`   Password: ${creds.password.replace(/./g, '*')}`);
                
                if (window.LearnTAVAuth) {
                    try {
                        const result = await window.LearnTAVAuth.login({
                            email: creds.email,
                            password: creds.password,
                            rememberMe: false
                        });
                        
                        console.log(`   ✅ SUCCESS: ${creds.source} credentials work!`);
                        console.log(`   User: ${result.user.fullName} (${result.user.role})`);
                        
                        // Clean up for next test
                        window.LearnTAVAuth.logout();
                        
                    } catch (error) {
                        console.log(`   ❌ FAILED: ${error.message}`);
                    }
                } else {
                    console.log(`   ⚠️ SKIPPED: LearnTAVAuth not available`);
                }
            }

            // Test admin auth system if available
            if (window.LearnTAVAdminAuth) {
                console.log(`\n🔒 Testing Admin Auth System...`);
                try {
                    const result = await window.LearnTAVAdminAuth.authenticate({
                        username: 'admin@learntav.com',
                        password: 'LearningAdmin123*',
                        code: '0410'
                    });
                    console.log(`   ✅ SUCCESS: Admin auth system works!`);
                } catch (error) {
                    console.log(`   ❌ FAILED: ${error.message}`);
                }
            }
        }

        generateReport() {
            console.log('\n📋 ========== DIAGNOSTIC SUMMARY ==========');
            
            console.log('\n🚨 CRITICAL ISSUES FOUND:');
            if (this.issues.length === 0) {
                console.log('   ✅ No critical issues detected');
            } else {
                this.issues.forEach((issue, index) => {
                    console.log(`   ${index + 1}. ${issue}`);
                });
            }

            console.log('\n🎯 ROOT CAUSE ANALYSIS:');
            if (this.diagnosticResults.credentialMismatch?.detected) {
                console.log('   🔴 PRIMARY: Multiple conflicting credential sets prevent successful login');
            }
            if (this.diagnosticResults.fragmentedAuth?.detected) {
                console.log('   🔴 SECONDARY: Fragmented authentication architecture causes session conflicts');
            }

            console.log('\n💡 RECOMMENDED FIXES:');
            console.log('   1. Standardize credentials across all systems');
            console.log('   2. Consolidate authentication into single system');
            console.log('   3. Create proper admin user accounts');
            console.log('   4. Fix session storage conflicts');

            console.log('\n🔍 ========== DIAGNOSTIC COMPLETE ==========');
        }
    }

    // Auto-run diagnostic if in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Wait for all auth systems to load
        setTimeout(() => {
            window.AuthDiagnostic = new AuthDiagnosticTool();
            window.runAuthDiagnostic = () => window.AuthDiagnostic.runFullDiagnostic();
            
            console.log('🔍 Auth Diagnostic Tool loaded - Use runAuthDiagnostic() to analyze');
        }, 2000);
    }

})();