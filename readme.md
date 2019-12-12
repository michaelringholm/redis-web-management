# Upgrade packages (optional)
``` sh
sudo apt update
sudo apt upgrade
```

# Install NodeJS
``` sh
curl -sL https://deb.nodesource.com/setup_13.x | sudo -E bash -
sudo apt-get install -y nodejs
```

# Install Service
``` sh
# Copy the .service file to /etc/systemd/system/
sudo cp redis-status-web.service /etc/systemd/system/
```

``` sh
# Start the service.
sudo systemctl start redis-status-web.service 
# Check the status of the service.
sudo systemctl status  redis-status-web.service 

# Commands for controlling the Redis service
sudo systemctl restart redis
sudo systemctl stop redis
sudo systemctl start redis
```

# Target
http://13.74.40.193:8081/

# Links
https://vegibit.com/render-html-in-node-js/

