pipeline {
    agent any

    stages {
        stage('Pull') {
            steps {
                sh 'cd /home/ubuntu/project/apps/ssadagu && git pull origin master'
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
