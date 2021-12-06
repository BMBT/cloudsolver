FROM google/cloud-sdk:alpine as gcloud

WORKDIR /app
ARG KEY_FILE_CONTENT
#RUN echo $KEY_FILE_CONTENT | gcloud auth activate-service-account get-service@dm885-cloud-solver.iam.gserviceaccount.com --key-file=-
RUN echo $KEY_FILE_CONTENT | gcloud auth activate-service-account get-service@dm885-cloud-solver.iam.gserviceaccount.com --key-file=- \
  && gsutil cp -r gs://dm885-cloud-solver.appspot.com/Solvers ./

FROM minizinc/minizinc
COPY --from=gcloud /app/Solvers /usr/local/share/minizinc/solvers
COPY ./executer /
ENTRYPOINT [ "bash", "/executer" ]
#get-service@dm885-cloud-solver.iam.gserviceaccount.com
#auth activate-service-account get-service@dm885-cloud-solver.iam.gserviceaccount.com --key-file=dm885-cloud-solver-e787ef682b18.json
#docker build --build-arg KEY_FILE_CONTENT="$(cat mykey.json)"\ 
#    -t gcr.io/$dm885-cloud-solver/$get-service.
#docker build --build-arg KEY_FILE_CONTENT="$(cat mykey.json)" -t gcr.io/$dm885-cloud-solver/$get-service.