pipeline {
    agent none // 전역 에이전트를 사용하지 않아 dev 브랜치가 아닐 경우 리소스 할당을 방지합니다.

    environment {
        BACKEND_IMAGE = "ssadagu-backend"
        FRONTEND_IMAGE = "ssadagu-frontend"
    }

    stages {
        stage('Ssadagu CI/CD') {
            when {
                branch 'dev' // 오직 dev 브랜치일 때만 아래 스테이지들을 실행합니다.
            }
            agent any // dev 브랜치일 때만 실제 빌드 에이전트(작업자)를 할당합니다.
            
            stages {
                stage('Checkout') {
                    steps {
                        checkout scm
                    }
                }

                stage('Build Backend') {
                    steps {
                        dir('Ssadagu-Backend') {
                            sh "docker build -t ${BACKEND_IMAGE}:latest ."
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        dir('Ssadagu-Frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE}:latest ."
                        }
                    }
                }

                stage('Deploy') {
                    steps {
                        sh 'docker-compose down'
                        sh 'docker-compose up -d --build'
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                // dev 브랜치에서 에이전트가 할당되었을 때만 cleanup을 수행합니다.
                if (env.BRANCH_NAME == 'dev') {
                    cleanWs()
                }
            }
        }
        success {
            echo "Successfully deployed 'dev' branch!"
        }
    }
}
