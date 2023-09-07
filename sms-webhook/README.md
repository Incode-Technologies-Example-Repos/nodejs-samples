## Build your image.

```
docker build -t sms-manual-review .
```

## Authenticate the Docker CLI to Amazon Elastic Container Registry

```
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 839567906018.dkr.ecr.us-west-2.amazonaws.com
```

## Create a repository

```
aws ecr create-repository --repository-name sms-manual-review --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE
```

```
{
    "repository": {
        "repositoryArn": "arn:aws:ecr:us-west-2:839567906018:repository/sms-manual-review",
        "registryId": "839567906018",
        "repositoryName": "sms-manual-review",
        "repositoryUri": "839567906018.dkr.ecr.us-west-2.amazonaws.com/sms-manual-review",
        "createdAt": "2022-09-05T23:47:29-07:00",
        "imageTagMutability": "MUTABLE",
        "imageScanningConfiguration": {
            "scanOnPush": true
        },
        "encryptionConfiguration": {
            "encryptionType": "AES256"
        }
    }
}

```

## Tag your image and deploy

```
docker tag  sms-manual-review:latest 839567906018.dkr.ecr.us-west-2.amazonaws.com/sms-manual-review:latest
docker push 839567906018.dkr.ecr.us-west-2.amazonaws.com/sms-manual-review:latest
```



## Run docker image locally

```
docker compose up
```


```
docker container run --name sms-manual-review -p 9000:8080 --env .env sms-manual-review
```


docker container run -v "$HOME/.aws":/root/.aws -e AWS_REGION=us-west-2 -e AWS_PROFILE=demo --name pugger -p 9000:8080 --env .env pug
-v "$HOME/.aws":/root/.aws \
  -e AWS_REGION=us-west-2 -e AWS_PROFILE=demo \


docker build -t pug .

curl --location --request POST 'http://localhost:9000/2015-03-31/functions/function/invocations' \
--header 'Content-Type: application/json' \
--data-raw '{ "body": { "image": "face" }}'



## Test lambda locally 

curl -i -H "Accept: application/json" -H "Content-Type: application/json" -X GET http://localhost:9000/2015-03-31/functions/function/invocations -d '{"id":"IDVALUE","name":"Mike"}'

curl -X POST http://localhost:9000/2015-03-31/functions/function/invocations
   -H 'Content-Type: application/json'
   -d '{"login":"my_login","password":"my_password"}'

curl -X POST  -H "Accept: Application/json" -H "Content-Type: application/json" http://localhost:9000/2015-03-31/functions/function/invocations -d '{"id":"IDVALUE","name":"Mike"}'

curl -X POST  -H "Accept: Application/json" -H "Content-Type: application/json" http://localhost:9000/2015-03-31/functions/function/invocations -d '{"id":"IDVALUE","name":"Mike"}'




# SMS Notificaiton Web Hook

## Get Started

First update ```sample.env``` with your Incode configuration and rename ```sammple.env``` to ```.env```.

Run the project like this:

```
npm install
npm start
```

## Features

* Sends SMS using Incode's SMS Service (this requires a phone number to be added to a session, sample does this)
* Example for executive log-in
* Example for omni/start API
* Session expire time can be configured inside Flow settings
 