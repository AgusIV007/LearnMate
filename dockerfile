FROM python:3.9 

WORKDIR /learnmate

RUN pip install upgrade pip && pip install -r requeriments.txt
CMD ["python", "aa.py"]