@echo off
setlocal

set "EVENT_ID=21777660-b0fd-405f-ab85-f68d0f0fcb73"

echo Using event id: %EVENT_ID%

set "API_URL=http://localhost:8080/api/codes/confirm-purchase"
set "ACTOR_ID=00000000-0000-0000-0000-000000000002"
set "PAYMENT_ID=fake_succeeded_local_test"

set "JSON={\"eventId\":\"%EVENT_ID%\",\"paymentIntentId\":\"%PAYMENT_ID%\"}"

echo Calling %API_URL%
echo Payload: %JSON%

curl.exe -sS -X POST "%API_URL%" ^
	-H "Content-Type: application/json" ^
	-H "X-Actor-Id: %ACTOR_ID%" ^
	-d "%JSON%"

if errorlevel 1 (
	echo.
	echo Request failed.
	exit /b 1
)

echo.
echo Done. Check MailHog: http://localhost:8025
exit /b 0