pipeline {
    agent any // 모든 단계와 post 블록에서 일관된 노드 환경을 사용하도록 설정 (리소스 최적화보다 안정성 우선)

    environment {
        BACKEND_IMAGE = "ssadagu-backend"
        FRONTEND_IMAGE = "ssadagu-frontend"
    }

    stages {
        stage('Initialize & Checkout') {
            steps {
                // 소스코드를 가져옵니다.
                checkout scm
                script {
                    // 상세 로그: 모든 가능성 있는 환경 변수 출력
                    echo "--- Jenkins Environment Variables ---"
                    echo "BRANCH_NAME: ${env.BRANCH_NAME}"
                    echo "GIT_BRANCH: ${env.GIT_BRANCH}"
                    echo "gitlabBranch: ${env.gitlabBranch}"
                    echo "gitlabSourceBranch: ${env.gitlabSourceBranch}"
                    
                    // 브랜치 감지 로직 고도화 (환경 변수 우선 시도 후 git 명령어로 직접 추출)
                    env.GIT_LOCAL_BRANCH = env.BRANCH_NAME ?: env.GIT_BRANCH ?: env.gitlabBranch ?: env.gitlabSourceBranch
                    if (!env.GIT_LOCAL_BRANCH) {
                        try {
                            env.GIT_LOCAL_BRANCH = sh(script: "git rev-parse --abbrev-ref HEAD", returnStdout: true).trim()
                        } catch (Exception e) {
                            echo "Failed to detect branch via git command: ${e.message}"
                            env.GIT_LOCAL_BRANCH = "unknown"
                        }
                    }
                    echo "Final Branch Detected: ${env.GIT_LOCAL_BRANCH}"
                }
            }
        }

        stage('Ssadagu Build & Deploy') {
            when {
                // 이 시점에는 GIT_LOCAL_BRANCH가 확실히 채워져 있습니다.
                expression { env.GIT_LOCAL_BRANCH?.contains('dev') }
            }
            
            stages {
                stage('Prepare & Deploy') {
                    steps {
                        script {
                            // Jenkins 'Secret File'형태의 Credentials를 사용하여 파일을 복사합니다.
                            try {
                                withCredentials([file(credentialsId: 'BACKEND_ENV_FILE', variable: 'BACK_FILE'),
                                                file(credentialsId: 'FRONTEND_ENV_FILE', variable: 'FRONT_FILE')]) {
                                    sh "cp ${BACK_FILE} ./Ssadagu-Backend/.env"
                                    sh "cp ${FRONT_FILE} ./Ssadagu-Frontend/.env.local"
                                    echo ".env 파일이 Secret File을 통해 복제되었습니다."
                                    sh 'ls -al ./Ssadagu-Backend/ ./Ssadagu-Frontend/'
                                }
                            } catch (Exception e) {
                                echo "Secret File을 찾을 수 없어 빌드를 중단합니다: ${e.message}"
                                error "Required Secret Files (BACKEND_ENV_FILE, FRONTEND_ENV_FILE) not found!"
                            }
                        }
                        
                        echo "Docker Compose를 이용한 서비스 빌드 (환경 변수 포함)"
                        sh 'docker-compose -p s14p21a202 build --pull backend frontend'
                        
                        echo "서비스 배포"
                        sh 'docker-compose -p s14p21a202 up -d backend frontend'
                        
                        echo "Nginx 설정 및 주소판 새로고침"
                        sh 'docker-compose -p s14p21a202 exec -T nginx nginx -s reload'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // 브랜치 정보 로깅
                def currentBranch = env.GIT_LOCAL_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'
                echo "Final identified branch for cleanup/notif: ${currentBranch}"

                // dev 브랜치 작업이 끝난 경우에만 워크스페이스를 정리합니다.
                if (currentBranch?.contains('dev')) {
                    echo "워크스페이스 정리 중... (Branch: ${currentBranch})"
                    cleanWs()
                }
            }
        }
        success {
            mattermostSend (
                color: "#00FF00",
                message: "✅ **Build Success: [${env.JOB_NAME} #${env.BUILD_NUMBER}](${env.BUILD_URL})**\n- Status: `SUCCESS` 🚀\n- Branch: `${env.GIT_LOCAL_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}`",
                endpoint: "https://meeting.ssafy.com/hooks/1cn86ho66jnu8kcmkrmr7md8ny"
            )
        }
        failure {
            mattermostSend (
                color: "#FF0000",
                message: "❌ **Build Failure: [${env.JOB_NAME} #${env.BUILD_NUMBER}](${env.BUILD_URL})**\n- Status: `FAILURE` 🚨\n- Branch: `${env.GIT_LOCAL_BRANCH ?: env.BRANCH_NAME ?: env.GIT_BRANCH ?: 'unknown'}`",
                endpoint: "https://meeting.ssafy.com/hooks/1cn86ho66jnu8kcmkrmr7md8ny"
            )
        }
    }
}