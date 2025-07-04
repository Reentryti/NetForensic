# Generated by Django 5.1.4 on 2025-06-27 14:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('capture', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Prediction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('src_port', models.PositiveIntegerField()),
                ('dst_port', models.PositiveIntegerField()),
                ('is_attack', models.BooleanField()),
                ('confidence', models.FloatField()),
            ],
        ),
        migrations.RemoveField(
            model_name='capturesession',
            name='interface',
        ),
        migrations.AddField(
            model_name='capturesession',
            name='interface_name',
            field=models.CharField(default='unknow', max_length=100),
            preserve_default=False,
        ),
    ]
