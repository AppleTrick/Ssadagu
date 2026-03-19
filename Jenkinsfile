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
                stage('Build Backend') {
                    steps {
                        dir('Ssadagu-Backend') {
                            echo "Back-end 빌드 시작: ${BACKEND_IMAGE}"
                            sh "docker build -t ${BACKEND_IMAGE}:latest ."
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        dir('Ssadagu-Frontend') {
                            echo "Front-end 빌드 시작: ${FRONTEND_IMAGE}"
                            sh "docker build -t ${FRONTEND_IMAGE}:latest ."
                        }
                    }
                }

                stage('Deploy') {
                    steps {
                        echo "도커 컴포즈 재시작 및 배포 진행"
                        script {
                            // Jenkins Credentials (Secret Text)를 사용하여 .env 파일 생성
                            // 'BACKEND_ENV', 'FRONTEND_ENV'라는 ID로 Secret Text Credentials가 등록되어야 합니다.
                            try {
                                withCredentials([string(credentialsId: 'BACKEND_ENV', variable: 'BACK_ENV'),
                                                string(credentialsId: 'FRONTEND_ENV', variable: 'FRONT_ENV')]) {
                                    sh 'echo "$BACK_ENV" > ./Ssadagu-Backend/.env'
                                    sh 'echo "$FRONT_ENV" > ./Ssadagu-Frontend/.env.local'
                                    echo ".env 파일이 Credentials를 통해 생성되었습니다."
                                }
                            } catch (Exception e) {
                                echo "Credentials를 찾을 수 없어 빈 파일로 생성합니다 (배포 후 수동 확인 필요): ${e.message}"
                                sh 'touch ./Ssadagu-Backend/.env'
                                sh 'touch ./Ssadagu-Frontend/.env.local'
                            }
                        }
                        
                        // 사용자 제안에 따라 이번 빌드에서 수정된 백엔드/프론트엔드 서비스만 선택적으로 업데이트합니다.
                        // nginx는 설정 변경이 잦지 않으므로 필요 시에만 수동으로 재시작하시기 바랍니다.
                        sh 'docker-compose up -d --build backend frontend'
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