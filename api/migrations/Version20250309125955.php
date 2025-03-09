<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250309125955 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE circuit ADD nature_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE circuit ADD CONSTRAINT FK_1325F3A63BCB2E4B FOREIGN KEY (nature_id) REFERENCES nature (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('CREATE INDEX IDX_1325F3A63BCB2E4B ON circuit (nature_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE circuit DROP CONSTRAINT FK_1325F3A63BCB2E4B');
        $this->addSql('DROP INDEX IDX_1325F3A63BCB2E4B');
        $this->addSql('ALTER TABLE circuit DROP nature_id');
    }
}
