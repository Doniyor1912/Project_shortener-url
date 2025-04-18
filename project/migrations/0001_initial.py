# Generated by Django 5.1.6 on 2025-02-06 07:48

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Shortened_db',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shorten_url', models.CharField(max_length=20, unique=True)),
                ('origin_url', models.URLField(max_length=500)),
                ('clicks', models.IntegerField(default=0)),
                ('status', models.IntegerField(default=1)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('last_accessed', models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]
