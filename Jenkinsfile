pipeline {
    agent any

    stages {
        stage('Pull') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'github-credentials', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_TOKEN')]) {
                    sh '''
                        cd /home/ubuntu/project/apps/ssadagu
                        git remote set-url origin https://${GIT_USER}:${GIT_TOKEN}@github.com/AppleTrick/Ssadagu.git
                        git pull origin master
                    '''
                }
            }
        }
        stage('Deploy') {
            steps {
                sh 'cd /home/ubuntu/project && docker compose up -d --build ssadagu-back ssadagu-front'
            }
        }
    }

    post {
        success {
            echo 'Ssadagu 배포 성공'
        }
        failure {
            echo 'Ssadagu 배포 실패'
        }
    }
}
