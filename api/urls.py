from api.spectacular.urls import urlpatterns as doc_urls
from users.urls import urlpatterns as users_urls
from project.urls import urlpatterns as project_urls
from project.short_link.urls import urlpatterns as project_short_link

app_name = 'api'



urlpatterns = [

]

# urlpatterns += doc_urls
urlpatterns += users_urls
urlpatterns += project_urls
urlpatterns += project_short_link

